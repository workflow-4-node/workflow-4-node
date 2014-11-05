var Promise = require("bluebird");
var _ = require("lodash");
var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;
var fast = require("fast.js");

function MongoDBPersistence(options) {
    if (!_.isObject(options)) throw new TypeError("Object argument 'options' expected.");
    if (!_.isString(options.connection)) throw new Error("Connection expected in the options.");
    this._options = _.extend(
        {
            connectionOptions: {db: {native_parser: false}},
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
    var self = this;
    return new Promise(
        function (resolve, reject) {
            try {
                if (!self._connectedAndInitialized) {
                    MongoClient.connect(self.options.connection, self.options.connectionOptions,
                        function (e, db) {
                            if (e) {
                                reject(e);
                                return;
                            }

                            var getColl = function (name) {
                                return new Promise(function (gcresolve, gcreject) {
                                    db.createCollection(name, function (e, coll) {
                                        if (e) gcreject(e); else gcresolve(coll);
                                    });
                                });
                            };

                            Promise.all([
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
                                function (e) {
                                    self._stateCollection = self._locksCollection = self._promotedPropertiesCollection = null;
                                    reject(e || new Error("Index create error."));
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
}

MongoDBPersistence.prototype._ensureIndexes = function () {
    var self = this;

    return Promise.settle([
        new Promise(function (resolve, reject) {
            self._locksCollection.ensureIndex({name: 1}, {w: 1, unique: true}, function (e) {
                if (e) reject(e); else resolve();
            });
        }),
        new Promise(function (resolve, reject) {
            self._locksCollection.ensureIndex({heldTo: 1}, {w: 1, unique: false}, function (e) {
                if (e) reject(e); else resolve();
            });
        }),
        new Promise(function (resolve, reject) {
            self._stateCollection.ensureIndex({workflowName: 1, instanceId: 1}, {w: 1, unique: true}, function (e) {
                if (e) reject(e); else resolve();
            });
        }),
        new Promise(function (resolve, reject) {
            self._promotedPropertiesCollection.ensureIndex({workflowName: 1, instanceId: 1}, {
                w: 1,
                unique: true
            }, function (e) {
                if (e) reject(e); else resolve();
            });
        })
    ]);
}

MongoDBPersistence.prototype.close = function () {
    var self = this;
    return new Promise(function (resolve, reject) {
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
}

// LOCKING
MongoDBPersistence.prototype.enterLock = function (lockName, inLockTimeoutMs) {
    var self = this;
    var now = new Date();

    return self._connectAndInit().then(
        function () {
            return self._removeOldLocks();
        }).then(
        function () {
            return new Promise(function (resolve, reject) {
                self._locksCollection.insertOne(
                    {
                        name: lockName,
                        heldTo: now.addMilliseconds(inLockTimeoutMs)
                    },
                    {w: 1},
                    function (e, result) {
                        if (e) {
                            if (e.toString().indexOf("E11000") === -1) {
                                reject(e); // Some MongoDB error
                                return;
                            }
                            resolve(null); // It's held.
                            return;
                        }

                        if (result.insertedCount == 0) {
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
}

MongoDBPersistence.prototype.renewLock = function (lockId, inLockTimeoutMs) {
    var self = this;
    return self._connectAndInit().then(
        function () {
            return new Promise(function (resolve, reject) {
                var now = new Date();
                self._locksCollection.update(
                    {
                        _id: lockId,
                        heldTo: {$lte: now}
                    },
                    {
                        $set: {heldTo: now.addMilliseconds(inLockTimeoutMs)}
                    },
                    {w: 1},
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
}

MongoDBPersistence.prototype.exitLock = function (lockId) {
    var self = this;

    return self._connectAndInit().then(
        function () {
            return new Promise(function (resolve, reject) {
                self._locksCollection.remove(
                    {_id: lockId},
                    {w: 1},
                    function (e) {
                        if (e) reject(e); else resolve();
                    });
            });
        });
};

MongoDBPersistence.prototype._removeOldLocks = function () {
    var self = this;
    var now = new Date();
    return new Promise(function (resolve, reject) {
        self._locksCollection.remove(
            {
                heldTo: {
                    $lt: now
                }
            },
            {w: 1},
            function (e) {
                if (e) reject(e); else resolve();
            });
    });
}

// STATE

MongoDBPersistence.prototype.isRunning = function (workflowName, instanceId) {
    var self = this;

    instanceId = instanceId.toString();

    return self._connectAndInit().then(
        function () {
            return new Promise(function (resolve, reject) {
                self._stateCollection.findOne(
                    {workflowName: workflowName, instanceId: instanceId},
                    {
                        w: 1,
                        fields: {_id: 1}
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
}

MongoDBPersistence.prototype.persistState = function (state) {
    var self = this;

    var instanceId = state.instanceId.toString();

    return self._connectAndInit().then(
        function () {
            function persistState() {
                return new Promise(function (resolve, reject) {
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
                            w: 1,
                            upsert: true
                        },
                        function (e) {
                            if (e) reject(e); else resolve();
                        });
                });
            }

            if (state.promotedProperties) {
                return Promise.settle(
                    [
                        persistState(),
                        new Promise(function (resolve, reject) {
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
                                    w: 1,
                                    upsert: true
                                },
                                function (e) {
                                    if (e) reject(e);
                                    else resolve();
                                });
                        })
                    ]);
            }
            else {
                return persistState();
            }
        });
}

MongoDBPersistence.prototype.getRunningInstanceIdHeader = function (workflowName, instanceId) {
    var self = this;

    instanceId = instanceId.toString();

    return self._connectAndInit().then(
        function () {
            return new Promise(function (resolve, reject) {
                self._stateCollection.findOne(
                    {
                        workflowName: workflowName,
                        instanceId: instanceId
                    },
                    {
                        w: 1,
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
}

MongoDBPersistence.prototype.loadState = function (workflowName, instanceId) {
    var self = this;

    instanceId = instanceId.toString();

    return self._connectAndInit().then(
        function () {
            return new Promise(function (resolve, reject) {
                self._stateCollection.findOne(
                    {
                        workflowName: workflowName,
                        instanceId: instanceId
                    },
                    {
                        w: 1,
                        fields: {_id: false}
                    },
                    function (e, r) {
                        if (e) {
                            reject(e);
                            return;
                        }

                        if (self.options.stringifyState) r.state = JSON.parse(r.state);
                        resolve(r);
                    });
            });
        });
}

MongoDBPersistence.prototype.removeState = function (workflowName, instanceId) {
    var self = this;

    instanceId = instanceId.toString();

    return self._connectAndInit().then(
        function () {
            function remove() {
                return new Promise(function (resolve, reject) {
                    self._stateCollection.remove(
                        {
                            workflowName: workflowName,
                            instanceId: instanceId
                        },
                        {w: 1},
                        function (e) {
                            if (e) reject(e); else resolve();
                        });
                });
            }

            if (self.options.enablePromotions) {
                return Promise.settle(
                    [
                        remove(),
                        new Promise(function (resolve, reject) {
                            self._promotedPropertiesCollection.remove(
                                {
                                    workflowName: workflowName,
                                    instanceId: instanceId
                                },
                                {w: 1},
                                function (e) {
                                    if (e) reject(e);
                                    else resolve();
                                });
                        })
                    ]);
            }
            else {
                return remove();
            }
        });
}

MongoDBPersistence.prototype.loadPromotedProperties = function (workflowName, instanceId) {
    var self = this;

    instanceId = instanceId.toString();

    return self._connectAndInit().then(
        function () {
            return new Promise(function (resolve, reject) {
                self._promotedPropertiesCollection.findOne(
                    {
                        workflowName: workflowName,
                        instanceId: instanceId
                    },
                    {
                        w: 1,
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
}

module.exports = MongoDBPersistence;
