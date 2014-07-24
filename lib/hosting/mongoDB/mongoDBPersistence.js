var asyncHelpers = require("../../common/asyncHelpers");
var async = asyncHelpers.async;
var await = asyncHelpers.await;
var Promise = require("bluebird");
var _ = require("lodash");
var Models = require("./models");
var mongoose = require('mongoose-q')(require('mongoose'), { spread: true });

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
    this._connection = null;
    this._models = null;
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
        connection: {
            get: function ()
            {
                return this._connection;
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
                    self._connection = mongoose.createConnection(self._options.connection, self._options.connectionOptions);
                    var remove = function (ofOpen)
                    {
                        if (ofOpen)
                        {
                            self._connection.removeListener("open", open);
                        }
                        else
                        {
                            self._connection.removeListener("error", error);
                        }
                    };
                    var open = function ()
                    {
                        try
                        {
                            self._models = new Models(self._connection, self._options);
                            self._connectedAndInitialized = true;
                            remove(false);
                            resolve();
                        }
                        catch (e)
                        {
                            reject(e);
                        }
                    };
                    var error = function (e)
                    {
                        remove(true);
                        reject(e);
                    };
                    self._connection.once("open", open);
                    self._connection.once("error", error);
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

MongoDBPersistence.prototype.close = function ()
{
    var self = this;
    return new Promise(function (resolve, reject)
    {
        if (self._connectedAndInitialized)
        {
            try
            {
                self._connection.close(function (err)
                {
                    if (err)
                    {
                        reject(err);
                        return;
                    }
                    self._connectedAndInitialized = false;
                    self._connection = null;
                    resolve();
                });
            }
            catch (e)
            {
                self._connectedAndInitialized = false;
                self._connection = null;
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
            return self.models.Lock.createQ(
                {
                    name: lockName,
                    heldTo: now.addMilliseconds(inLockTimeoutMs)
                }).then(
                    function(result)
                    {
                        return  {
                            id: result.id,
                            name: result.name,
                            heldTo: result.heldTo
                        };
                    },
                    function (e)
                    {
                        if (e.toString().indexOf("E11000") === -1) throw e;
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
                    cLock.heldTo = new Date().addMilliseconds(inLockTimeoutMs)
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
    var now = new Date();
    return this.models.Lock.removeQ({
        heldTo: {
            $lt: now
        }
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
            return  self.models.State.find({ workflowName: workflowName, "idleMethods.methodName": methodName })
                .select("idleMethods")
                .lean()
                .execQ()
                .then(
                function(queryResult)
                {
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

                    return result;
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
