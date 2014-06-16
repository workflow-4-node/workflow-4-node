var asyncHelpers = require("../common/asyncHelpers");
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
                        if (ofOpen) self._connection.removeListener("open", open);
                        else self._connection.removeListener("error", error);
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

// LOCKING
MongoDBPersistence.prototype.enterLock = async(
    function (lockName, inLockTimeoutMs)
    {
        await(this._connectAndInit());

        var self = this
        var now = new Date();

        var id = mongoose.Types.ObjectId();
        var result =
            await(
                this.model.State.findOneAndUpdateQ(
                    {
                        name: lockName,
                        heldTo: {
                            $gt: now
                        }
                    },
                    {
                        _id: id,
                        name: lockName,
                        heldTo: now.addMilliseconds(inLockTimeoutMs)
                    },
                    {
                        upsert: true
                    }));

        return result && result._id === id;
    });

MongoDBPersistence.prototype.renewLock = async(
    function (lockId, inLockTimeoutMs)
    {
        await(this._connectAndInit());

        var cLock = await(this._getLockById(lockId));
        cLock.heldTo = new Date().addMilliseconds(inLockTimeoutMs);
        await(cLock.saveQ());
    });

MongoDBPersistence.prototype.exitLock = async(
    function (lockId)
    {
        await(this._connectAndInit());

        await(this.models.Lock.removeQ({_id: lockId}));
    });

MongoDBPersistence.prototype._getLockById = async(
    function (lockId)
    {
        var cLock = await(this.models.Lock.findByIdQ(lockId));
        var now = new Date();
        if (!cLock || now.compareTo(cLock.heldTo) > -1) throw new Error("Lock by id '" + lockId + "' doesn't exists.");
        return cLock;
    });

// STATE
MongoDBPersistence.prototype.getRunningInstanceIdPaths = async(
    function (workflowName, methodName)
    {
        await(this._connectAndInit());

        var cursor =
            await(
                this.models.State.find({ workflowName: workflowName, idleMethods: { $elemMatch: { methodName: methodName } } })
                    .select("idleMethods")
                    .lean()
                    .execQ());

        var result = [];

        cursor.each(
            function (m)
            {
                if (m.methodName == methodName)
                {
                    result.push(m.instanceIdPath);
                }
            });

        return result;
    });

MongoDBPersistence.prototype.isRunning = async(
    function (workflowName, instanceId)
    {
        await(this._connectAndInit());

        return await(
            self.models.State.findOne({ workflowName: workflowName, instanceId: instanceId})
                .select("_id")
                .lean()
                .execQ()) ?
            true :
            false;
    });

MongoDBPersistence.prototype.persistState = async(
    function (state)
    {
        await(this._connectAndInit());

        await(
            [
                this.model.State.findOneAndUpdateQ(
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
                    }),
                this.model.PromotedProperties.findOneAndUpdateQ(
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
                    })
            ]);
    });

MongoDBPersistence.prototype.getRunningInstanceIdHeader = async(
    function (workflowName, instanceId, methodName)
    {
        await(this._connectAndInit());

        var result =
            await(
                this.model.State.findOne(
                    {
                        workflowName: state.workflowName,
                        instanceId: state.instanceId,
                        idleMethods: { $elemMatch: { methodName: methodName } }
                    },
                    "idleMethods updatedOn version").lean().execQ());

        if (result)
        {
            var path;
            result.idleMethods.forEach(
                function (m)
                {
                    if (m === methodName)
                    {
                        path = m.instanceIdPath;
                        return false;
                    }
                });

            return {
                instanceIdPath: path,
                instanceId: result.instanceId,
                version: result.version
            };
        }

        return null;
    });

MongoDBPersistence.prototype.loadState = async(
    function (workflowName, instanceId)
    {
        await(this._connectAndInit());

        return await(
            this.model.State.findOne(
                {
                    workflowName: state.workflowName,
                    instanceId: state.instanceId
                }).lean().execQ());
    });

MongoDBPersistence.prototype.removeState = async(
    function (workflowName, instanceId)
    {
        await(this._connectAndInit());

        await([
            this.model.State.findOneAndRemoveQ(
                {
                    workflowName: state.workflowName,
                    instanceId: state.instanceId
                }),
            this.model.PromotedProperties.findOneAndRemoveQ(
                {
                    workflowName: state.workflowName,
                    instanceId: state.instanceId
                })
        ]);
    });

// Promo

module.exports = MongoDBPersistence;
