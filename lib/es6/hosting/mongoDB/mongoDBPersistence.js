"use strict";

let Bluebird = require("bluebird");
let _ = require("lodash");
let mongodb = require("mongodb");
let MongoClient = mongodb.MongoClient;
let common = require("../../common");
let async = common.asyncHelpers.async;
let errors = common.errors;

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
            stringifyState: true,
            enablePromotions: true,
            w: "majority"
        },
        options);
    this._db = null;
    this._stateCollection = null;
    this._promotedPropertiesCollection = null;
    this._locksCollection = null;
    this._connectedAndInitialized = false;
    this._w = { w: this._options.w };
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

MongoDBPersistence.prototype._connectAndInit = async(function* () {
    if (!this._connectedAndInitialized) {
        let db = yield MongoClient.connect(this.options.connection, this.options.connectionOptions);
        this._stateCollection = yield db.createCollection(this.options.stateCollectionName, this._w);
        this._locksCollection = yield db.createCollection(this.options.locksCollectionName, this._w);
        this._promotedPropertiesCollection = yield db.createCollection(this.options.promotedPropertiesCollectionName, this._w);

        yield this._ensureIndexes();
        this._db = db;
        this._connectedAndInitialized = true;
    }
});

MongoDBPersistence.prototype._ensureIndexes = function () {
    let self = this;

    return Bluebird.all([
        self._locksCollection.ensureIndex({ name: 1 }, { w: this._w.w, unique: true }),
        self._locksCollection.ensureIndex({ heldTo: 1 }, { w: this._w.w, unique: false }),
        self._stateCollection.ensureIndex(
            { "activeDelay.methodName": 1 },
            {
                w: this._w.w,
                unique: false
            }
        ),
        self._stateCollection.ensureIndex(
            { "activeDelay.delayTo": 1 },
            {
                w: this._w.w,
                unique: false
            }
        )
    ]);
};

MongoDBPersistence.prototype.close = async(function* () {
    if (this._connectedAndInitialized) {
        yield this._db.close();
        this._connectedAndInitialized = false;
        this._db = this._stateCollection = this._locksCollection = this._promotedPropertiesCollection = null;
    }
});

// Internal
MongoDBPersistence.prototype.__clear = function () {
    let self = this;
    return self._connectAndInit()
        .then(function () {
            return Bluebird.all([
                self._locksCollection.deleteMany({}, { w: self._w.w }),
                self._stateCollection.deleteMany({}, { w: self._w.w }),
                self._promotedPropertiesCollection.deleteMany({}, { w: self._w.w })]);
        });
};

// LOCKING
MongoDBPersistence.prototype.enterLock = async(function* (lockName, inLockTimeoutMs) {
    yield this._connectAndInit();
    yield this._removeOldLocks();
    try {
        let now = new Date();
        let result = yield this._locksCollection.insertOne(
            {
                name: lockName,
                heldTo: now.addMilliseconds(inLockTimeoutMs)
            },
            { w: this._w.w }
        );

        if (result.insertedCount === 0) {
            return null; // It's held.
        }

        return {
            id: result.ops[0]._id,
            name: result.ops[0].name,
            heldTo: result.ops[0].heldTo
        };
    }
    catch (e) {
        if (e.code === 11000) {
            return null; // It's held.
        }
        throw e; // Some MongoDB error
    }
});

MongoDBPersistence.prototype.renewLock = async(function* (lockId, inLockTimeoutMs) {
    yield self._connectAndInit();
    let now = new Date();
    let r = yield this._locksCollection.update(
        {
            _id: lockId,
            heldTo: { $lte: now }
        },
        {
            $set: { heldTo: now.addMilliseconds(inLockTimeoutMs) }
        },
        { w: this._w.w }
    );
    if (r.nModified === 0) {
        throw new errors.ActivityRuntimeError("Lock by id '" + lockId + "' doesn't exists or not held.");
    }
});

MongoDBPersistence.prototype.exitLock = async(function* (lockId) {
    yield this._connectAndInit();
    yield this._locksCollection.deleteOne(
        { _id: lockId },
        { w: this._w.w }
    );
});

MongoDBPersistence.prototype._removeOldLocks = async(function* () {
    let now = new Date();
    yield this._connectAndInit();
    yield this._locksCollection.remove(
        {
            heldTo: {
                $lt: now
            }
        },
        { w: this._w.w }
    );
});

// STATE

MongoDBPersistence.prototype.isRunning = async(function* (workflowName, instanceId) {
    yield this._connectAndInit();
    
    instanceId = instanceId.toString();
    let r = yield this._stateCollection.findOne(
        { _id: { workflowName: workflowName, instanceId: instanceId } },
        {
            w: this._w.w,
            fields: { _id: 1 }
        }
    );

    return !!r;
});

MongoDBPersistence.prototype.persistState = async(function* (state) {
    let self = this;
    yield self._connectAndInit();

    let instanceId = state.instanceId.toString();

    function persistState() {
        return self._stateCollection.update(
            {
                _id: {
                    workflowName: state.workflowName,
                    instanceId: instanceId
                }
            },
            {
                workflowVersion: state.workflowVersion,
                createdOn: state.createdOn,
                updatedOn: state.updatedOn,
                state: self.options.stringifyState ? JSON.stringify(state.state) : state.state
            },
            {
                w: self._w.w,
                upsert: true
            }
        );
    }

    if (state.promotedProperties && self.options.enablePromotions) {
        yield Bluebird.all([
            persistState(),
            self._promotedPropertiesCollection.update(
                {
                    _id: {
                        workflowName: state.workflowName,
                        instanceId: instanceId
                    }
                },
                {
                    workflowVersion: state.workflowVersion,
                    createdOn: state.createdOn,
                    updatedOn: state.updatedOn,
                    properties: state.promotedProperties
                },
                {
                    w: self._w.w,
                    upsert: true
                }
            )
        ]);
    }
    else {
        yield persistState();
    }
});

MongoDBPersistence.prototype.getRunningInstanceIdHeader = async(function* (workflowName, instanceId) {
    yield this._connectAndInit();

    instanceId = instanceId.toString();

    let result = yield this._stateCollection.findOne(
        {
            _id: {
                workflowName: workflowName,
                instanceId: instanceId
            }
        },
        {
            w: this._w.w,
            fields: {
                _id: 0,
                updatedOn: 1,
                workflowVersion: 1
            }
        }
    );

    return {
        workflowName: workflowName,
        instanceId: instanceId,
        updatedOn: result.updatedOn,
        workflowVersion: result.workflowVersion
    };
});

MongoDBPersistence.prototype.loadState = async(function* (workflowName, instanceId) {
    yield this._connectAndInit();

    instanceId = instanceId.toString();
    
    let r = yield this._stateCollection.findOne(
        {
            _id: {
                workflowName: workflowName,
                instanceId: instanceId
            }
        },
        {
            w: this._w.w,
            fields: {
                _id: 0
            }
        }
    );

    if (this.options.stringifyState) {
        r.state = JSON.parse(r.state);
    }
    r.workflowName = workflowName;
    r.instanceId = instanceId;
    return r;
});

MongoDBPersistence.prototype.removeState = async(function* (workflowName, instanceId) {
    let self = this;
    yield self._connectAndInit();

    instanceId = instanceId.toString();

    function remove() {
        return self._stateCollection.remove(
            {
                _id: {
                    workflowName: workflowName,
                    instanceId: instanceId
                }
            },
            { w: self._w.w }
        );
    }

    if (self.options.enablePromotions) {
        yield Bluebird.all([
            remove(),
            self._promotedPropertiesCollection.remove(
                {
                    _id: {
                        workflowName: workflowName,
                        instanceId: instanceId
                    }
                },
                { w: self._w.w }
            )
        ]);
    }
    else {
        yield remove();
    }
});

MongoDBPersistence.prototype.loadPromotedProperties = async(function* (workflowName, instanceId) {
    if (!this.options.enablePromotions) {
        return null;
    }

    yield this._connectAndInit();

    instanceId = instanceId.toString();

    let pp = yield this._promotedPropertiesCollection.findOne(
        {
            _id: {
                workflowName: workflowName,
                instanceId: instanceId
            }
        },
        {
            w: this._w.w,
            fields: {
                properties: 1
            }
        }
    );

    return pp ? pp.properties : null;
});

module.exports = MongoDBPersistence;
