var Promise = require("bluebird");
var _ = require("lodash");
var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;

function MongoDBPersistence(options)
{
    if (!_.isObject(options)) throw new TypeError("Object argument 'options' expected.");
    if (!_.isString(options.connection)) throw new Error("Connection expected in the options.");
    this._options = _.extend(
        {
            connectionOptions: {},
            stateCollectionName: "WFState",
            promotedPropertiesCollectionName: "WFPromotedProperties",
            locksCollectionName: "WFLocks"
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
            get: function ()
            {
                return this._options;
            }
        },
        models: {
            get: function ()
            {
                return this._models;
            }
        }
    });

MongoDBPersistence.prototype._connectAndInit = function ()
{
    var self = this;
    return new Promise(
        function (resolve, reject)
        {
            try
            {
                if (!self._connectedAndInitialized)
                {
                    MongoClient.connect(self.options.connection, self.options.connectionOptions,
                        function (e, db)
                        {
                            if (e)
                            {
                                reject(e);
                                return;
                            }

                            var getColl = function(name)
                            {
                                return new Promise(function (gcresolve, gcreject)
                                {
                                    db.createCollection(name, function(e, coll)
                                    {
                                        if (e) gcreject(e); else gcresolve(coll);
                                    });
                                });
                            };

                            Promise.all([
                                getColl(self.options.stateCollectionName).then(
                                    function(coll)
                                    {
                                        self._stateCollection = coll;
                                    }),
                                getColl(self.options.locksCollectionName).then(
                                    function(coll)
                                    {
                                        self._locksCollection = coll;
                                    }),
                                getColl(self.options.promotedPropertiesCollectionName).then(
                                    function(coll)
                                    {
                                        self._promotedPropertiesCollection = coll;
                                    })
                            ]).then(
                                function()
                                {
                                    self._db = db;
                                    self._connectedAndInitialized = true;
                                    resolve();
                                },
                                function(e)
                                {
                                    self._stateCollection = self._locksCollection = self._promotedPropertiesCollection = null;
                                    reject(e);
                                });
                        });
                }
                else
                {
                    resolve();
                }
            }
            catch (e)
            {
                reject(e);
            }
        });
}

MongoDBPersistence.prototype._ensureIndexes = function()
{
    var self = this;

    return new Promise(function(reject, resolve)
    {
        resolve();
    });
}

MongoDBPersistence.prototype.close = function ()
{
    var self = this;
    return new Promise(function (resolve, reject)
    {
        if (self._connectedAndInitialized)
        {
            try
            {
                self._db.close(function (err)
                {
                    if (err)
                    {
                        reject(err);
                        return;
                    }
                    self._connectedAndInitialized = false;
                    self._db = self._stateCollection = self._locksCollection = self._promotedPropertiesCollection = null;
                    resolve();
                });
            }
            catch (e)
            {
                reject(e);
            }
        }
        else
        {
            resolve();
        }
    });
}

// LOCKING
MongoDBPersistence.prototype.enterLock = function (lockName, inLockTimeoutMs)
{
    var self = this;
    var now = new Date();

    return self._connectAndInit().then(
        function()
        {
            return self._removeOldLocks();
        }).then(
        function()
        {
            return new Promise(function(resolve, reject)
            {
                self._locksCollection.insert(
                    {
                        name: lockName,
                        heldTo: now.addMilliseconds(inLockTimeoutMs)
                    },
                    { w: 1 },
                    function (e, result)
                    {
                        if (e)
                        {
                            if (e.toString().indexOf("E11000") === -1)
                            {
                                reject(e); // Some MongoDB error
                                return;
                            }
                            resolve(null); // It's held.
                            return;
                        }

                        resolve(result[0]);
                    });
            });
        });
}

MongoDBPersistence.prototype.renewLock = function (lockId, inLockTimeoutMs)
{
    var self = this;
    return self._connectAndInit().then(
        function()
        {
            return self._getLockById(lockId).then(
                function(cLock)
                {
                    cLock.heldTo = new Date().addMilliseconds(inLockTimeoutMs);
                    return cLock.saveQ();
                });
        });
}

MongoDBPersistence.prototype.exitLock = function (lockId)
{
    var self = this;

    return self._connectAndInit().then(
        function()
        {
            return self.models.Lock.removeQ({_id: lockId});
        });
};

MongoDBPersistence.prototype._removeOldLocks = function ()
{
    var self = this;
    var now = new Date();
    return new Promise(function (resolve, reject)
    {
        self._locksCollection.remove(
            {
                heldTo: {
                    $lt: now
                }
            },
            {w: 1},
            function(e)
            {
                if (e) reject(e); else resolve();
            });
    });
}

MongoDBPersistence.prototype._getLockById = function (lockId)
{
    return this.models.Lock.findByIdQ(lockId).then(
        function (cLock)
        {
            var now = new Date();
            if (!cLock || now.compareTo(cLock.heldTo) > -1) throw new Error("Lock by id '" + lockId + "' doesn't exists.");
            return cLock;
        });
};

// STATE
MongoDBPersistence.prototype.getRunningInstanceIdPaths = function (workflowName, methodName)
{
    var self = this;

    return self._connectAndInit().then(
        function()
        {
            return new Promise(function(resolve, reject)
            {
                self._stateCollection.find({ workflowName: workflowName, "idleMethods.methodName": methodName }, { fields: { idleMethods: 1 }}).toArray(
                    function (e, queryResult)
                    {
                        if (e)
                        {
                            reject(e);
                            return;
                        }

                        var result = [];

                        queryResult.forEach(
                            function (s)
                            {
                                s.idleMethods.forEach(function (m)
                                {
                                    if (m.methodName === methodName)
                                    {
                                        result.push(m.instanceIdPath);
                                    }
                                });
                            });

                        resolve(result);
                    });
            });
        });
}

MongoDBPersistence.prototype.isRunning = function (workflowName, instanceId)
{
    var self = this;

    return self._connectAndInit().then(
        function()
        {
            return self.models.State.findOne({ workflowName: workflowName, instanceId: instanceId})
                .select("_id")
                .lean()
                .execQ()
                .then(
                function(id)
                {
                    return id ? true : false;
                });
        });
}

MongoDBPersistence.prototype.persistState = function (state)
{
    var self = this;

    return self._connectAndInit().then(
        function()
        {
            return Promise.all([
                self.models.State.findOneAndUpdate(
                    {
                        workflowName: state.workflowName,
                        instanceId: state.instanceId
                    },
                    {
                        workflowVersion: state.workflowVersion,
                        createdOn: state.createdOn,
                        updatedOn: state.updatedOn,
                        idleMethods: state.idleMethods,
                        state: state.state
                    },
                    {
                        upsert: true
                    }).select("_id").lean().execQ(),
                self.models.PromotedProperties.findOneAndUpdate(
                    {
                        workflowName: state.workflowName,
                        instanceId: state.instanceId
                    },
                    {
                        workflowVersion: state.workflowVersion,
                        createdOn: state.createdOn,
                        updatedOn: state.updatedOn,
                        properties: state.promotedProperties
                    },
                    {
                        upsert: true
                    }).select("_id").lean().execQ()
            ]);
        });
}

MongoDBPersistence.prototype.getRunningInstanceIdHeader = function (workflowName, instanceId, methodName)
{
    var self = this;

    return self._connectAndInit().then(
        function()
        {
            return self.models.State.findOne(
                {
                    workflowName: workflowName,
                    instanceId: instanceId,
                    "idleMethods.methodName": methodName
                }).select("idleMethods updatedOn workflowVersion").lean().execQ().then(
                function(result)
                {
                    if (result)
                    {
                        var path;
                        result.idleMethods.forEach(
                            function (m)
                            {
                                if (m.methodName === methodName)
                                {
                                    path = m.instanceIdPath;
                                    return false;
                                }
                            });

                        return {
                            instanceIdPath: path,
                            updatedOn: result.updatedOn,
                            workflowVersion: result.workflowVersion
                        };
                    }

                    return null;
                });
        });
}

MongoDBPersistence.prototype.loadState = function (workflowName, instanceId)
{
    var self = this;
    
    return self._connectAndInit().then(
        function()
        {
            return self.models.State.findOne(
                {
                    workflowName: workflowName,
                    instanceId: instanceId
                }).lean().execQ();
        });
}

MongoDBPersistence.prototype.removeState = function (workflowName, instanceId)
{
    var self = this;
    
    return self._connectAndInit().then(
        function()
        {
            return Promise.all(
                [
                    self.models.State.findOneAndRemoveQ(
                        {
                            workflowName: workflowName,
                            instanceId: instanceId
                        }),
                    self.models.PromotedProperties.findOneAndRemoveQ(
                        {
                            workflowName: workflowName,
                            instanceId: instanceId
                        })
                ]);
        });
}

MongoDBPersistence.prototype.loadPromotedProperties = function (workflowName, instanceId)
{
    var self = this;
    
    return self._connectAndInit().then(
        function()
        {
            return self.models.PromotedProperties.findOne(
                {
                    workflowName: workflowName,
                    instanceId: instanceId
                }).select("properties").lean().execQ().then(
                function(pp)
                {
                    return pp ? pp.properties : null;
                });
        });
}

module.exports = MongoDBPersistence;
