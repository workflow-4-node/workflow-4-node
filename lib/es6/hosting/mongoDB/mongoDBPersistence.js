"use strict";

let Bluebird = require("bluebird");
let _ = require("lodash");
let mongodb = require("mongodb");
let MongoClient = mongodb.MongoClient;

function MongoDBPersistence(options) {
    if (!_.isObject(options)) {
        throw new TypeError("Object argument 'options' expected.");
    }
    if (!_.isString(options.connection)) {
        throw new Error("Connection expected in the options.");
    }
    this._options = _.extend(
        {
            connectionOptions: { db: { native_parser: false } },
            stateCollectionName: "WFState",
            promotedPropertiesCollectionName: "WFPromotedProperties",
            locksCollectionName: "WFLocks",
            stringifyState: true
        },
        options);
    this._db = null;
    this._stateCollection = null;
    this._promotedPropertiesCollection = null;
    this._locksCollection = null;
    this._connectedAndInitialized = false;
}

Object.defineProperties(
    MongoDBPersistence.prototype,
    {
        options: {
            get: function () {
                return this._options;
            }
        }
    });

MongoDBPersistence.prototype._connectAndInit = function () {
    let self = this;
    return new Bluebird(
        function (resolve, reject) {
            try {
                if (!self._connectedAndInitialized) {
                    MongoClient.connect(self.options.connection, self.options.connectionOptions,
                        function (e, db) {
                            if (e) {
                                reject(e);
                                return;
                            }

                            let getColl = function (name) {
                                return new Bluebird(function (gcresolve, gcreject) {
                                    db.createCollection(name, function (gce, gccoll) {
                                        if (gce) {
                                            gcreject(gce);
                                        }
                                        else {
                                            gcresolve(gccoll);
                                        }
                                    });
                                });
                            };

                            Bluebird.all([
                                getColl(self.options.stateCollectionName).then(
                                    function (coll) {
                                        self._stateCollection = coll;
                                    }),
                                getColl(self.options.locksCollectionName).then(
                                    function (coll) {
                                        self._locksCollection = coll;
                                    }),
                                getColl(self.options.promotedPropertiesCollectionName).then(
                                    function (coll) {
                                        self._promotedPropertiesCollection = coll;
                                    })
                            ])
                                .then(function () {
                                    return self._ensureIndexes();
                                })
                                .then(function () {
                                    self._db = db;
                                    self._connectedAndInitialized = true;
                                    resolve();
                                },
                                function (err) {
                                    self._stateCollection = self._locksCollection = self._promotedPropertiesCollection = null;
                                    reject(err || new Error("Index create error."));
                                });
                        });
                }
                else {
                    resolve();
                }
            }
            catch (e) {
                reject(e);
            }
        });
};

MongoDBPersistence.prototype._ensureIndexes = function () {
    let self = this;

    return Bluebird.all([
        new Bluebird(function (resolve, reject) {
            self._locksCollection.ensureIndex({ name: 1 }, { w: "majority", unique: true }, function (e) {
                if (e) {
                    reject(e);
                }
                else {
                    resolve();
                }
            });
        }),
        new Bluebird(function (resolve, reject) {
            self._locksCollection.ensureIndex({ heldTo: 1 }, { w: "majority", unique: false }, function (e) {
                if (e) {
                    reject(e);
                }
                else {
                    resolve();
                }
            });
        }),
        new Bluebird(function (resolve, reject) {
            self._stateCollection.ensureIndex(
                { workflowName: 1, instanceId: 1 },
                {
                    w: "majority",
                    unique: true
                },
                function (e) {
                    if (e) {
                        reject(e);
                    }
                    else {
                        resolve();
                    }
                });
        }),
        new Bluebird(function (resolve, reject) {
            self._promotedPropertiesCollection.ensureIndex(
                { workflowName: 1, instanceId: 1 },
                {
                    w: "majority",
                    unique: true
                },
                function (e) {
                    if (e) {
                        reject(e);
                    }
                    else {
                        resolve();
                    }
                });
        })
    ]);
};

MongoDBPersistence.prototype.close = function () {
    let self = this;
    return new Bluebird(function (resolve, reject) {
        if (self._connectedAndInitialized) {
            try {
                self._db.close(function (err) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    self._connectedAndInitialized = false;
                    self._db = self._stateCollection = self._locksCollection = self._promotedPropertiesCollection = null;
                    resolve();
                });
            }
            catch (e) {
                reject(e);
            }
        }
        else {
            resolve();
        }
    });
};

// LOCKING
MongoDBPersistence.prototype.enterLock = function (lockName, inLockTimeoutMs) {
    let self = this;
    let now = new Date();

    return self._connectAndInit().then(
        function () {
            return self._removeOldLocks();
        }).then(
        function () {
            return new Bluebird(function (resolve, reject) {
                self._locksCollection.insertOne(
                    {
                        name: lockName,
                        heldTo: now.addMilliseconds(inLockTimeoutMs)
                    },
                    { w: "majority" },
                    function (e, result) {
                        if (e) {
                            if (e.toString().indexOf("E11000") === -1) {
                                reject(e); // Some MongoDB error
                                return;
                            }
                            resolve(null); // It's held.
                            return;
                        }

                        if (result.insertedCount === 0) {
                            resolve(null); // It's held.
                            return;
                        }

                        resolve({
                            id: result.ops[0]._id,
                            name: result.ops[0].name,
                            heldTo: result.ops[0].heldTo
                        });
                    });
            });
        });
};

MongoDBPersistence.prototype.renewLock = function (lockId, inLockTimeoutMs) {
    let self = this;
    return self._connectAndInit().then(
        function () {
            return new Bluebird(function (resolve, reject) {
                let now = new Date();
                self._locksCollection.update(
                    {
                        _id: lockId,
                        heldTo: { $lte: now }
                    },
                    {
                        $set: { heldTo: now.addMilliseconds(inLockTimeoutMs) }
                    },
                    { w: "majority" },
                    function (e, r) {
                        if (e) {
                            reject(e);
                            return;
                        }
                        if (r.nModified === 0) {
                            reject(new Error("Lock by id '" + lockId + "' doesn't exists or not held."));
                            return;
                        }
                        resolve();
                    });
            });
        });
};

MongoDBPersistence.prototype.exitLock = function (lockId) {
    let self = this;

    return self._connectAndInit().then(
        function () {
            return new Bluebird(function (resolve, reject) {
                self._locksCollection.remove(
                    { _id: lockId },
                    { w: "majority" },
                    function (e) {
                        if (e) {
                            reject(e);
                        }
                        else {
                            resolve();
                        }
                    });
            });
        });
};

MongoDBPersistence.prototype._removeOldLocks = function () {
    let self = this;
    let now = new Date();
    return new Bluebird(function (resolve, reject) {
        self._locksCollection.remove(
            {
                heldTo: {
                    $lt: now
                }
            },
            { w: "majority" },
            function (e) {
                if (e) {
                    reject(e);
                }
                else {
                    resolve();
                }
            });
    });
};

// STATE

MongoDBPersistence.prototype.isRunning = function (workflowName, instanceId) {
    let self = this;

    instanceId = instanceId.toString();

    return self._connectAndInit().then(
        function () {
            return new Bluebird(function (resolve, reject) {
                self._stateCollection.findOne(
                    { workflowName: workflowName, instanceId: instanceId },
                    {
                        w: "majority",
                        fields: { _id: 1 }
                    },
                    function (e, id) {
                        if (e) {
                            reject(e);
                            return;
                        }
                        resolve(id ? true : false);
                    });
            });
        });
};

MongoDBPersistence.prototype.persistState = function (state) {
    let self = this;

    let instanceId = state.instanceId.toString();

    return self._connectAndInit().then(
        function () {
            function persistState() {
                return new Bluebird(function (resolve, reject) {
                    self._stateCollection.update(
                        {
                            workflowName: state.workflowName,
                            instanceId: instanceId
                        },
                        {
                            workflowName: state.workflowName,
                            instanceId: instanceId,
                            workflowVersion: state.workflowVersion,
                            createdOn: state.createdOn,
                            updatedOn: state.updatedOn,
                            state: self.options.stringifyState ? JSON.stringify(state.state) : state.state
                        },
                        {
                            w: "majority",
                            upsert: true
                        },
                        function (e) {
                            if (e) {
                                reject(e);
                            }
                            else {
                                resolve();
                            }
                        });
                });
            }

            if (state.promotedProperties) {
                return Bluebird.all(
                    [
                        persistState(),
                        new Bluebird(function (resolve, reject) {
                            self._promotedPropertiesCollection.update(
                                {
                                    workflowName: state.workflowName,
                                    instanceId: instanceId
                                },
                                {
                                    workflowName: state.workflowName,
                                    instanceId: instanceId,
                                    workflowVersion: state.workflowVersion,
                                    createdOn: state.createdOn,
                                    updatedOn: state.updatedOn,
                                    properties: state.promotedProperties
                                },
                                {
                                    w: "majority",
                                    upsert: true
                                },
                                function (e) {
                                    if (e) {
                                        reject(e);
                                    }
                                    else {
                                        resolve();
                                    }
                                });
                        })
                    ]);
            }
            else {
                return persistState();
            }
        });
};

MongoDBPersistence.prototype.getRunningInstanceIdHeader = function (workflowName, instanceId) {
    let self = this;

    instanceId = instanceId.toString();

    return self._connectAndInit().then(
        function () {
            return new Bluebird(function (resolve, reject) {
                self._stateCollection.findOne(
                    {
                        workflowName: workflowName,
                        instanceId: instanceId
                    },
                    {
                        w: "majority",
                        fields: {
                            updatedOn: 1,
                            workflowVersion: 1
                        }
                    },
                    function (e, result) {
                        if (e) {
                            reject(e);
                            return;
                        }

                        resolve(result);
                    });
            });
        });
};

MongoDBPersistence.prototype.loadState = function (workflowName, instanceId) {
    let self = this;

    instanceId = instanceId.toString();

    return self._connectAndInit().then(
        function () {
            return new Bluebird(function (resolve, reject) {
                self._stateCollection.findOne(
                    {
                        workflowName: workflowName,
                        instanceId: instanceId
                    },
                    {
                        w: "majority",
                        fields: { _id: false }
                    },
                    function (e, r) {
                        if (e) {
                            reject(e);
                            return;
                        }

                        if (self.options.stringifyState) {
                            r.state = JSON.parse(r.state);
                        }
                        resolve(r);
                    });
            });
        });
};

MongoDBPersistence.prototype.removeState = function (workflowName, instanceId) {
    let self = this;

    instanceId = instanceId.toString();

    return self._connectAndInit().then(
        function () {
            function remove() {
                return new Bluebird(function (resolve, reject) {
                    self._stateCollection.remove(
                        {
                            workflowName: workflowName,
                            instanceId: instanceId
                        },
                        { w: "majority" },
                        function (e) {
                            if (e) {
                                reject(e);
                            }
                            else {
                                resolve();
                            }
                        });
                });
            }

            if (self.options.enablePromotions) {
                return Bluebird.all(
                    [
                        remove(),
                        new Bluebird(function (resolve, reject) {
                            self._promotedPropertiesCollection.remove(
                                {
                                    workflowName: workflowName,
                                    instanceId: instanceId
                                },
                                { w: "majority" },
                                function (e) {
                                    if (e) {
                                        reject(e);
                                    }
                                    else {
                                        resolve();
                                    }
                                });
                        })
                    ]);
            }
            else {
                return remove();
            }
        });
};

MongoDBPersistence.prototype.loadPromotedProperties = function (workflowName, instanceId) {
    let self = this;

    instanceId = instanceId.toString();

    return self._connectAndInit().then(
        function () {
            return new Bluebird(function (resolve, reject) {
                self._promotedPropertiesCollection.findOne(
                    {
                        workflowName: workflowName,
                        instanceId: instanceId
                    },
                    {
                        w: "majority",
                        fields: {
                            properties: 1
                        }
                    },
                    function (e, pp) {
                        if (e) {
                            reject(e);
                            return;
                        }

                        resolve(pp ? pp.properties : null);
                    });
            });
        });
};

module.exports = MongoDBPersistence;
