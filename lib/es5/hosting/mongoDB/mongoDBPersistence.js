"use strict";
var Bluebird = require("bluebird");
var _ = require("lodash");
var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;
var common = require("../../common");
var async = common.asyncHelpers.async;
var errors = common.errors;
function MongoDBPersistence(options) {
  if (!_.isObject(options)) {
    throw new TypeError("Object argument 'options' expected.");
  }
  if (!_.isString(options.connection)) {
    throw new Error("Connection expected in the options.");
  }
  this._options = _.extend({
    connectionOptions: {db: {native_parser: false}},
    stateCollectionName: "WFState",
    promotedPropertiesCollectionName: "WFPromotedProperties",
    locksCollectionName: "WFLocks",
    stringifyState: true,
    enablePromotions: true,
    w: "majority"
  }, options);
  this._db = null;
  this._stateCollection = null;
  this._promotedPropertiesCollection = null;
  this._locksCollection = null;
  this._connectedAndInitialized = false;
  this._w = {w: this._options.w};
}
Object.defineProperties(MongoDBPersistence.prototype, {options: {get: function() {
      return this._options;
    }}});
MongoDBPersistence.prototype._connectAndInit = async($traceurRuntime.initGeneratorFunction(function $__3() {
  var db;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          $ctx.state = (!this._connectedAndInitialized) ? 1 : -2;
          break;
        case 1:
          $ctx.state = 2;
          return MongoClient.connect(this.options.connection, this.options.connectionOptions);
        case 2:
          db = $ctx.sent;
          $ctx.state = 4;
          break;
        case 4:
          $ctx.state = 6;
          return db.createCollection(this.options.stateCollectionName, this._w);
        case 6:
          this._stateCollection = $ctx.sent;
          $ctx.state = 8;
          break;
        case 8:
          $ctx.state = 10;
          return db.createCollection(this.options.locksCollectionName, this._w);
        case 10:
          this._locksCollection = $ctx.sent;
          $ctx.state = 12;
          break;
        case 12:
          $ctx.state = 14;
          return db.createCollection(this.options.promotedPropertiesCollectionName, this._w);
        case 14:
          this._promotedPropertiesCollection = $ctx.sent;
          $ctx.state = 16;
          break;
        case 16:
          $ctx.state = 18;
          return this._ensureIndexes();
        case 18:
          $ctx.maybeThrow();
          $ctx.state = 20;
          break;
        case 20:
          this._db = db;
          this._connectedAndInitialized = true;
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__3, this);
}));
MongoDBPersistence.prototype._ensureIndexes = function() {
  var self = this;
  return Bluebird.all([self._locksCollection.ensureIndex({name: 1}, {
    w: this._w.w,
    unique: true
  }), self._locksCollection.ensureIndex({heldTo: 1}, {
    w: this._w.w,
    unique: false
  }), self._locksCollection.ensureIndex({activeDelays: 1}, {
    w: this._w.w,
    unique: false
  }), self._stateCollection.ensureIndex({"activeDelays.methodName": 1}, {
    w: this._w.w,
    unique: false
  }), self._stateCollection.ensureIndex({"activeDelays.delayTo": 1}, {
    w: this._w.w,
    unique: false
  })]);
};
MongoDBPersistence.prototype.close = async($traceurRuntime.initGeneratorFunction(function $__4() {
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          $ctx.state = (this._connectedAndInitialized) ? 1 : -2;
          break;
        case 1:
          $ctx.state = 2;
          return this._db.close();
        case 2:
          $ctx.maybeThrow();
          $ctx.state = 4;
          break;
        case 4:
          this._connectedAndInitialized = false;
          this._db = this._stateCollection = this._locksCollection = this._promotedPropertiesCollection = null;
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__4, this);
}));
MongoDBPersistence.prototype.__clear = function() {
  var self = this;
  return self._connectAndInit().then(function() {
    return Bluebird.all([self._locksCollection.deleteMany({}, {w: self._w.w}), self._stateCollection.deleteMany({}, {w: self._w.w}), self._promotedPropertiesCollection.deleteMany({}, {w: self._w.w})]);
  });
};
MongoDBPersistence.prototype.enterLock = async($traceurRuntime.initGeneratorFunction(function $__5(lockName, inLockTimeoutMs) {
  var now,
      result,
      e;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          $ctx.state = 2;
          return this._connectAndInit();
        case 2:
          $ctx.maybeThrow();
          $ctx.state = 4;
          break;
        case 4:
          $ctx.state = 6;
          return this._removeOldLocks();
        case 6:
          $ctx.maybeThrow();
          $ctx.state = 8;
          break;
        case 8:
          $ctx.pushTry(25, null);
          $ctx.state = 28;
          break;
        case 28:
          now = new Date();
          $ctx.state = 19;
          break;
        case 19:
          $ctx.state = 10;
          return this._locksCollection.insertOne({
            name: lockName,
            heldTo: now.addMilliseconds(inLockTimeoutMs)
          }, {w: this._w.w});
        case 10:
          result = $ctx.sent;
          $ctx.state = 12;
          break;
        case 12:
          $ctx.state = (result.insertedCount === 0) ? 13 : 14;
          break;
        case 13:
          $ctx.returnValue = null;
          $ctx.state = -2;
          break;
        case 14:
          $ctx.returnValue = {
            id: result.ops[0]._id,
            name: result.ops[0].name,
            heldTo: result.ops[0].heldTo
          };
          $ctx.state = -2;
          break;
        case 17:
          $ctx.popTry();
          $ctx.state = -2;
          break;
        case 25:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          e = $ctx.storedException;
          $ctx.state = 22;
          break;
        case 22:
          $ctx.state = (e.code === 11000) ? 20 : 21;
          break;
        case 20:
          $ctx.returnValue = null;
          $ctx.state = -2;
          break;
        case 21:
          throw e;
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__5, this);
}));
MongoDBPersistence.prototype.renewLock = async($traceurRuntime.initGeneratorFunction(function $__6(lockId, inLockTimeoutMs) {
  var now,
      r;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          $ctx.state = 2;
          return self._connectAndInit();
        case 2:
          $ctx.maybeThrow();
          $ctx.state = 4;
          break;
        case 4:
          now = new Date();
          $ctx.state = 10;
          break;
        case 10:
          $ctx.state = 6;
          return this._locksCollection.update({
            _id: lockId,
            heldTo: {$lte: now}
          }, {$set: {heldTo: now.addMilliseconds(inLockTimeoutMs)}}, {w: this._w.w});
        case 6:
          r = $ctx.sent;
          $ctx.state = 8;
          break;
        case 8:
          if (r.nModified === 0) {
            throw new errors.ActivityRuntimeError("Lock by id '" + lockId + "' doesn't exists or not held.");
          }
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__6, this);
}));
MongoDBPersistence.prototype.exitLock = async($traceurRuntime.initGeneratorFunction(function $__7(lockId) {
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          $ctx.state = 2;
          return this._connectAndInit();
        case 2:
          $ctx.maybeThrow();
          $ctx.state = 4;
          break;
        case 4:
          $ctx.state = 6;
          return this._locksCollection.deleteOne({_id: lockId}, {w: this._w.w});
        case 6:
          $ctx.maybeThrow();
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__7, this);
}));
MongoDBPersistence.prototype._removeOldLocks = async($traceurRuntime.initGeneratorFunction(function $__8() {
  var now;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          now = new Date();
          $ctx.state = 10;
          break;
        case 10:
          $ctx.state = 2;
          return this._connectAndInit();
        case 2:
          $ctx.maybeThrow();
          $ctx.state = 4;
          break;
        case 4:
          $ctx.state = 6;
          return this._locksCollection.remove({heldTo: {$lt: now}}, {w: this._w.w});
        case 6:
          $ctx.maybeThrow();
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__8, this);
}));
MongoDBPersistence.prototype.isRunning = async($traceurRuntime.initGeneratorFunction(function $__9(workflowName, instanceId) {
  var r;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          $ctx.state = 2;
          return this._connectAndInit();
        case 2:
          $ctx.maybeThrow();
          $ctx.state = 4;
          break;
        case 4:
          instanceId = instanceId.toString();
          $ctx.state = 12;
          break;
        case 12:
          $ctx.state = 6;
          return this._stateCollection.findOne({_id: {
              workflowName: workflowName,
              instanceId: instanceId
            }}, {
            w: this._w.w,
            fields: {_id: 1}
          });
        case 6:
          r = $ctx.sent;
          $ctx.state = 8;
          break;
        case 8:
          $ctx.returnValue = !!r;
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__9, this);
}));
MongoDBPersistence.prototype.persistState = async($traceurRuntime.initGeneratorFunction(function $__10(state) {
  function persistState() {
    return self._stateCollection.update({_id: {
        workflowName: state.workflowName,
        instanceId: instanceId
      }}, {
      workflowVersion: state.workflowVersion,
      createdOn: state.createdOn,
      updatedOn: state.updatedOn,
      activeDelays: state.activeDelays || null,
      state: self.options.stringifyState ? JSON.stringify(state.state) : state.state
    }, {
      w: self._w.w,
      upsert: true
    });
  }
  var self,
      instanceId;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          self = this;
          $ctx.state = 15;
          break;
        case 15:
          $ctx.state = 2;
          return self._connectAndInit();
        case 2:
          $ctx.maybeThrow();
          $ctx.state = 4;
          break;
        case 4:
          instanceId = state.instanceId.toString();
          $ctx.state = 17;
          break;
        case 17:
          $ctx.state = (state.promotedProperties && self.options.enablePromotions) ? 5 : 9;
          break;
        case 5:
          $ctx.state = 6;
          return Bluebird.all([persistState(), self._promotedPropertiesCollection.update({_id: {
              workflowName: state.workflowName,
              instanceId: instanceId
            }}, {
            workflowVersion: state.workflowVersion,
            createdOn: state.createdOn,
            updatedOn: state.updatedOn,
            properties: state.promotedProperties
          }, {
            w: self._w.w,
            upsert: true
          })]);
        case 6:
          $ctx.maybeThrow();
          $ctx.state = -2;
          break;
        case 9:
          $ctx.state = 10;
          return persistState();
        case 10:
          $ctx.maybeThrow();
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__10, this);
}));
MongoDBPersistence.prototype.getRunningInstanceIdHeader = async($traceurRuntime.initGeneratorFunction(function $__11(workflowName, instanceId) {
  var result;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          $ctx.state = 2;
          return this._connectAndInit();
        case 2:
          $ctx.maybeThrow();
          $ctx.state = 4;
          break;
        case 4:
          instanceId = instanceId.toString();
          $ctx.state = 12;
          break;
        case 12:
          $ctx.state = 6;
          return this._stateCollection.findOne({_id: {
              workflowName: workflowName,
              instanceId: instanceId
            }}, {
            w: this._w.w,
            fields: {
              _id: 0,
              updatedOn: 1,
              workflowVersion: 1
            }
          });
        case 6:
          result = $ctx.sent;
          $ctx.state = 8;
          break;
        case 8:
          $ctx.returnValue = {
            workflowName: workflowName,
            instanceId: instanceId,
            updatedOn: result.updatedOn,
            workflowVersion: result.workflowVersion
          };
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__11, this);
}));
MongoDBPersistence.prototype.loadState = async($traceurRuntime.initGeneratorFunction(function $__12(workflowName, instanceId) {
  var r;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          $ctx.state = 2;
          return this._connectAndInit();
        case 2:
          $ctx.maybeThrow();
          $ctx.state = 4;
          break;
        case 4:
          instanceId = instanceId.toString();
          $ctx.state = 12;
          break;
        case 12:
          $ctx.state = 6;
          return this._stateCollection.findOne({_id: {
              workflowName: workflowName,
              instanceId: instanceId
            }}, {
            w: this._w.w,
            fields: {_id: 0}
          });
        case 6:
          r = $ctx.sent;
          $ctx.state = 8;
          break;
        case 8:
          if (this.options.stringifyState) {
            r.state = JSON.parse(r.state);
          }
          r.workflowName = workflowName;
          r.instanceId = instanceId;
          $ctx.state = 14;
          break;
        case 14:
          $ctx.returnValue = r;
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__12, this);
}));
MongoDBPersistence.prototype.removeState = async($traceurRuntime.initGeneratorFunction(function $__13(workflowName, instanceId) {
  function remove() {
    return self._stateCollection.remove({_id: {
        workflowName: workflowName,
        instanceId: instanceId
      }}, {w: self._w.w});
  }
  var self;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          self = this;
          $ctx.state = 15;
          break;
        case 15:
          $ctx.state = 2;
          return self._connectAndInit();
        case 2:
          $ctx.maybeThrow();
          $ctx.state = 4;
          break;
        case 4:
          instanceId = instanceId.toString();
          $ctx.state = 17;
          break;
        case 17:
          $ctx.state = (self.options.enablePromotions) ? 5 : 9;
          break;
        case 5:
          $ctx.state = 6;
          return Bluebird.all([remove(), self._promotedPropertiesCollection.remove({_id: {
              workflowName: workflowName,
              instanceId: instanceId
            }}, {w: self._w.w})]);
        case 6:
          $ctx.maybeThrow();
          $ctx.state = -2;
          break;
        case 9:
          $ctx.state = 10;
          return remove();
        case 10:
          $ctx.maybeThrow();
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__13, this);
}));
MongoDBPersistence.prototype.loadPromotedProperties = async($traceurRuntime.initGeneratorFunction(function $__14(workflowName, instanceId) {
  var pp;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          $ctx.state = (!this.options.enablePromotions) ? 1 : 2;
          break;
        case 1:
          $ctx.returnValue = null;
          $ctx.state = -2;
          break;
        case 2:
          $ctx.state = 5;
          return this._connectAndInit();
        case 5:
          $ctx.maybeThrow();
          $ctx.state = 7;
          break;
        case 7:
          instanceId = instanceId.toString();
          $ctx.state = 15;
          break;
        case 15:
          $ctx.state = 9;
          return this._promotedPropertiesCollection.findOne({_id: {
              workflowName: workflowName,
              instanceId: instanceId
            }}, {
            w: this._w.w,
            fields: {properties: 1}
          });
        case 9:
          pp = $ctx.sent;
          $ctx.state = 11;
          break;
        case 11:
          $ctx.returnValue = pp ? pp.properties : null;
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__14, this);
}));
MongoDBPersistence.prototype.getNextWakeupables = async($traceurRuntime.initGeneratorFunction(function $__15(count) {
  var result;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          $ctx.state = 2;
          return this._connectAndInit();
        case 2:
          $ctx.maybeThrow();
          $ctx.state = 4;
          break;
        case 4:
          $ctx.state = 6;
          return this._stateCollection.aggregate([{$match: {activeDelays: {$ne: null}}}, {$project: {activeDelays: 1}}, {$unwind: "$activeDelays"}, {$sort: {
              updatedOn: 1,
              "activeDelays.delayTo": 1
            }}, {$limit: count}]).toArray();
        case 6:
          result = $ctx.sent;
          $ctx.state = 8;
          break;
        case 8:
          $ctx.returnValue = result.map(function(r) {
            return {
              instanceId: r._id.instanceId,
              workflowName: r._id.workflowName,
              activeDelay: {
                methodName: r.activeDelays.methodName,
                delayTo: r.activeDelays.delayTo
              }
            };
          });
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__15, this);
}));
module.exports = MongoDBPersistence;
//# sourceMappingURL=data:application/json;base64,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QSxZQUM1QixDQUNKLENBQ0EsRUFBRSxNQUFLLENBQUcsTUFBSSxDQUFFLENBQ3BCLENBQUMsUUFDTSxBQUFDLEVBQUM7O2lCQXpZakIsQ0FBQSxJQUFHLEtBQUs7Ozs7QUFBUixhQUFHLFlBQVksRUEyWUosQ0FBQSxNQUFLLElBQUksQUFBQyxDQUFDLFNBQVMsQ0FBQSxDQUFHO0FBQzFCLGlCQUFPO0FBQ0gsdUJBQVMsQ0FBRyxDQUFBLENBQUEsSUFBSSxXQUFXO0FBQzNCLHlCQUFXLENBQUcsQ0FBQSxDQUFBLElBQUksYUFBYTtBQUMvQix3QkFBVSxDQUFHO0FBQ1QseUJBQVMsQ0FBRyxDQUFBLENBQUEsYUFBYSxXQUFXO0FBQ3BDLHNCQUFNLENBQUcsQ0FBQSxDQUFBLGFBQWEsUUFBUTtBQUFBLGNBQ2xDO0FBQUEsWUFDSixDQUFDO1VBQ0wsQ0FBQyxBQXBaOEIsQ0FBQTs7OztBQUFuQyxlQUFPLENBQUEsSUFBRyxJQUFJLEFBQUMsRUFBQyxDQUFBOztBQUNtQixFQUMvQixRQUE2QixLQUFHLENBQUMsQ0FBQztBQW1adEMsQ0FyWnVELENBcVp0RCxDQUFDO0FBRUYsS0FBSyxRQUFRLEVBQUksbUJBQWlCLENBQUM7QUFDbkMiLCJmaWxlIjoiaG9zdGluZy9tb25nb0RCL21vbmdvREJQZXJzaXN0ZW5jZS5qcyIsInNvdXJjZVJvb3QiOiJsaWIvZXM2Iiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbmxldCBCbHVlYmlyZCA9IHJlcXVpcmUoXCJibHVlYmlyZFwiKTtcbmxldCBfID0gcmVxdWlyZShcImxvZGFzaFwiKTtcbmxldCBtb25nb2RiID0gcmVxdWlyZShcIm1vbmdvZGJcIik7XG5sZXQgTW9uZ29DbGllbnQgPSBtb25nb2RiLk1vbmdvQ2xpZW50O1xubGV0IGNvbW1vbiA9IHJlcXVpcmUoXCIuLi8uLi9jb21tb25cIik7XG5sZXQgYXN5bmMgPSBjb21tb24uYXN5bmNIZWxwZXJzLmFzeW5jO1xubGV0IGVycm9ycyA9IGNvbW1vbi5lcnJvcnM7XG5cbmZ1bmN0aW9uIE1vbmdvREJQZXJzaXN0ZW5jZShvcHRpb25zKSB7XG4gICAgaWYgKCFfLmlzT2JqZWN0KG9wdGlvbnMpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJPYmplY3QgYXJndW1lbnQgJ29wdGlvbnMnIGV4cGVjdGVkLlwiKTtcbiAgICB9XG4gICAgaWYgKCFfLmlzU3RyaW5nKG9wdGlvbnMuY29ubmVjdGlvbikpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ29ubmVjdGlvbiBleHBlY3RlZCBpbiB0aGUgb3B0aW9ucy5cIik7XG4gICAgfVxuICAgIHRoaXMuX29wdGlvbnMgPSBfLmV4dGVuZChcbiAgICAgICAge1xuICAgICAgICAgICAgY29ubmVjdGlvbk9wdGlvbnM6IHsgZGI6IHsgbmF0aXZlX3BhcnNlcjogZmFsc2UgfSB9LFxuICAgICAgICAgICAgc3RhdGVDb2xsZWN0aW9uTmFtZTogXCJXRlN0YXRlXCIsXG4gICAgICAgICAgICBwcm9tb3RlZFByb3BlcnRpZXNDb2xsZWN0aW9uTmFtZTogXCJXRlByb21vdGVkUHJvcGVydGllc1wiLFxuICAgICAgICAgICAgbG9ja3NDb2xsZWN0aW9uTmFtZTogXCJXRkxvY2tzXCIsXG4gICAgICAgICAgICBzdHJpbmdpZnlTdGF0ZTogdHJ1ZSxcbiAgICAgICAgICAgIGVuYWJsZVByb21vdGlvbnM6IHRydWUsXG4gICAgICAgICAgICB3OiBcIm1ham9yaXR5XCJcbiAgICAgICAgfSxcbiAgICAgICAgb3B0aW9ucyk7XG4gICAgdGhpcy5fZGIgPSBudWxsO1xuICAgIHRoaXMuX3N0YXRlQ29sbGVjdGlvbiA9IG51bGw7XG4gICAgdGhpcy5fcHJvbW90ZWRQcm9wZXJ0aWVzQ29sbGVjdGlvbiA9IG51bGw7XG4gICAgdGhpcy5fbG9ja3NDb2xsZWN0aW9uID0gbnVsbDtcbiAgICB0aGlzLl9jb25uZWN0ZWRBbmRJbml0aWFsaXplZCA9IGZhbHNlO1xuICAgIHRoaXMuX3cgPSB7IHc6IHRoaXMuX29wdGlvbnMudyB9O1xufVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhcbiAgICBNb25nb0RCUGVyc2lzdGVuY2UucHJvdG90eXBlLFxuICAgIHtcbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX29wdGlvbnM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuTW9uZ29EQlBlcnNpc3RlbmNlLnByb3RvdHlwZS5fY29ubmVjdEFuZEluaXQgPSBhc3luYyhmdW5jdGlvbiogKCkge1xuICAgIGlmICghdGhpcy5fY29ubmVjdGVkQW5kSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgbGV0IGRiID0geWllbGQgTW9uZ29DbGllbnQuY29ubmVjdCh0aGlzLm9wdGlvbnMuY29ubmVjdGlvbiwgdGhpcy5vcHRpb25zLmNvbm5lY3Rpb25PcHRpb25zKTtcbiAgICAgICAgdGhpcy5fc3RhdGVDb2xsZWN0aW9uID0geWllbGQgZGIuY3JlYXRlQ29sbGVjdGlvbih0aGlzLm9wdGlvbnMuc3RhdGVDb2xsZWN0aW9uTmFtZSwgdGhpcy5fdyk7XG4gICAgICAgIHRoaXMuX2xvY2tzQ29sbGVjdGlvbiA9IHlpZWxkIGRiLmNyZWF0ZUNvbGxlY3Rpb24odGhpcy5vcHRpb25zLmxvY2tzQ29sbGVjdGlvbk5hbWUsIHRoaXMuX3cpO1xuICAgICAgICB0aGlzLl9wcm9tb3RlZFByb3BlcnRpZXNDb2xsZWN0aW9uID0geWllbGQgZGIuY3JlYXRlQ29sbGVjdGlvbih0aGlzLm9wdGlvbnMucHJvbW90ZWRQcm9wZXJ0aWVzQ29sbGVjdGlvbk5hbWUsIHRoaXMuX3cpO1xuXG4gICAgICAgIHlpZWxkIHRoaXMuX2Vuc3VyZUluZGV4ZXMoKTtcbiAgICAgICAgdGhpcy5fZGIgPSBkYjtcbiAgICAgICAgdGhpcy5fY29ubmVjdGVkQW5kSW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgIH1cbn0pO1xuXG5Nb25nb0RCUGVyc2lzdGVuY2UucHJvdG90eXBlLl9lbnN1cmVJbmRleGVzID0gZnVuY3Rpb24gKCkge1xuICAgIGxldCBzZWxmID0gdGhpcztcblxuICAgIHJldHVybiBCbHVlYmlyZC5hbGwoW1xuICAgICAgICBzZWxmLl9sb2Nrc0NvbGxlY3Rpb24uZW5zdXJlSW5kZXgoeyBuYW1lOiAxIH0sIHsgdzogdGhpcy5fdy53LCB1bmlxdWU6IHRydWUgfSksXG4gICAgICAgIHNlbGYuX2xvY2tzQ29sbGVjdGlvbi5lbnN1cmVJbmRleCh7IGhlbGRUbzogMSB9LCB7IHc6IHRoaXMuX3cudywgdW5pcXVlOiBmYWxzZSB9KSxcbiAgICAgICAgc2VsZi5fbG9ja3NDb2xsZWN0aW9uLmVuc3VyZUluZGV4KHsgYWN0aXZlRGVsYXlzOiAxIH0sIHsgdzogdGhpcy5fdy53LCB1bmlxdWU6IGZhbHNlIH0pLFxuICAgICAgICBzZWxmLl9zdGF0ZUNvbGxlY3Rpb24uZW5zdXJlSW5kZXgoXG4gICAgICAgICAgICB7IFwiYWN0aXZlRGVsYXlzLm1ldGhvZE5hbWVcIjogMSB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHc6IHRoaXMuX3cudyxcbiAgICAgICAgICAgICAgICB1bmlxdWU6IGZhbHNlXG4gICAgICAgICAgICB9XG4gICAgICAgICksXG4gICAgICAgIHNlbGYuX3N0YXRlQ29sbGVjdGlvbi5lbnN1cmVJbmRleChcbiAgICAgICAgICAgIHsgXCJhY3RpdmVEZWxheXMuZGVsYXlUb1wiOiAxIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdzogdGhpcy5fdy53LFxuICAgICAgICAgICAgICAgIHVuaXF1ZTogZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgIF0pO1xufTtcblxuTW9uZ29EQlBlcnNpc3RlbmNlLnByb3RvdHlwZS5jbG9zZSA9IGFzeW5jKGZ1bmN0aW9uKiAoKSB7XG4gICAgaWYgKHRoaXMuX2Nvbm5lY3RlZEFuZEluaXRpYWxpemVkKSB7XG4gICAgICAgIHlpZWxkIHRoaXMuX2RiLmNsb3NlKCk7XG4gICAgICAgIHRoaXMuX2Nvbm5lY3RlZEFuZEluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2RiID0gdGhpcy5fc3RhdGVDb2xsZWN0aW9uID0gdGhpcy5fbG9ja3NDb2xsZWN0aW9uID0gdGhpcy5fcHJvbW90ZWRQcm9wZXJ0aWVzQ29sbGVjdGlvbiA9IG51bGw7XG4gICAgfVxufSk7XG5cbi8vIEludGVybmFsXG5Nb25nb0RCUGVyc2lzdGVuY2UucHJvdG90eXBlLl9fY2xlYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBzZWxmLl9jb25uZWN0QW5kSW5pdCgpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBCbHVlYmlyZC5hbGwoW1xuICAgICAgICAgICAgICAgIHNlbGYuX2xvY2tzQ29sbGVjdGlvbi5kZWxldGVNYW55KHt9LCB7IHc6IHNlbGYuX3cudyB9KSxcbiAgICAgICAgICAgICAgICBzZWxmLl9zdGF0ZUNvbGxlY3Rpb24uZGVsZXRlTWFueSh7fSwgeyB3OiBzZWxmLl93LncgfSksXG4gICAgICAgICAgICAgICAgc2VsZi5fcHJvbW90ZWRQcm9wZXJ0aWVzQ29sbGVjdGlvbi5kZWxldGVNYW55KHt9LCB7IHc6IHNlbGYuX3cudyB9KV0pO1xuICAgICAgICB9KTtcbn07XG5cbi8vIExPQ0tJTkdcbk1vbmdvREJQZXJzaXN0ZW5jZS5wcm90b3R5cGUuZW50ZXJMb2NrID0gYXN5bmMoZnVuY3Rpb24qIChsb2NrTmFtZSwgaW5Mb2NrVGltZW91dE1zKSB7XG4gICAgeWllbGQgdGhpcy5fY29ubmVjdEFuZEluaXQoKTtcbiAgICB5aWVsZCB0aGlzLl9yZW1vdmVPbGRMb2NrcygpO1xuICAgIHRyeSB7XG4gICAgICAgIGxldCBub3cgPSBuZXcgRGF0ZSgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0geWllbGQgdGhpcy5fbG9ja3NDb2xsZWN0aW9uLmluc2VydE9uZShcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiBsb2NrTmFtZSxcbiAgICAgICAgICAgICAgICBoZWxkVG86IG5vdy5hZGRNaWxsaXNlY29uZHMoaW5Mb2NrVGltZW91dE1zKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHsgdzogdGhpcy5fdy53IH1cbiAgICAgICAgKTtcblxuICAgICAgICBpZiAocmVzdWx0Lmluc2VydGVkQ291bnQgPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsOyAvLyBJdCdzIGhlbGQuXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaWQ6IHJlc3VsdC5vcHNbMF0uX2lkLFxuICAgICAgICAgICAgbmFtZTogcmVzdWx0Lm9wc1swXS5uYW1lLFxuICAgICAgICAgICAgaGVsZFRvOiByZXN1bHQub3BzWzBdLmhlbGRUb1xuICAgICAgICB9O1xuICAgIH1cbiAgICBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoZS5jb2RlID09PSAxMTAwMCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7IC8vIEl0J3MgaGVsZC5cbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBlOyAvLyBTb21lIE1vbmdvREIgZXJyb3JcbiAgICB9XG59KTtcblxuTW9uZ29EQlBlcnNpc3RlbmNlLnByb3RvdHlwZS5yZW5ld0xvY2sgPSBhc3luYyhmdW5jdGlvbiogKGxvY2tJZCwgaW5Mb2NrVGltZW91dE1zKSB7XG4gICAgeWllbGQgc2VsZi5fY29ubmVjdEFuZEluaXQoKTtcbiAgICBsZXQgbm93ID0gbmV3IERhdGUoKTtcbiAgICBsZXQgciA9IHlpZWxkIHRoaXMuX2xvY2tzQ29sbGVjdGlvbi51cGRhdGUoXG4gICAgICAgIHtcbiAgICAgICAgICAgIF9pZDogbG9ja0lkLFxuICAgICAgICAgICAgaGVsZFRvOiB7ICRsdGU6IG5vdyB9XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgICRzZXQ6IHsgaGVsZFRvOiBub3cuYWRkTWlsbGlzZWNvbmRzKGluTG9ja1RpbWVvdXRNcykgfVxuICAgICAgICB9LFxuICAgICAgICB7IHc6IHRoaXMuX3cudyB9XG4gICAgKTtcbiAgICBpZiAoci5uTW9kaWZpZWQgPT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5BY3Rpdml0eVJ1bnRpbWVFcnJvcihcIkxvY2sgYnkgaWQgJ1wiICsgbG9ja0lkICsgXCInIGRvZXNuJ3QgZXhpc3RzIG9yIG5vdCBoZWxkLlwiKTtcbiAgICB9XG59KTtcblxuTW9uZ29EQlBlcnNpc3RlbmNlLnByb3RvdHlwZS5leGl0TG9jayA9IGFzeW5jKGZ1bmN0aW9uKiAobG9ja0lkKSB7XG4gICAgeWllbGQgdGhpcy5fY29ubmVjdEFuZEluaXQoKTtcbiAgICB5aWVsZCB0aGlzLl9sb2Nrc0NvbGxlY3Rpb24uZGVsZXRlT25lKFxuICAgICAgICB7IF9pZDogbG9ja0lkIH0sXG4gICAgICAgIHsgdzogdGhpcy5fdy53IH1cbiAgICApO1xufSk7XG5cbk1vbmdvREJQZXJzaXN0ZW5jZS5wcm90b3R5cGUuX3JlbW92ZU9sZExvY2tzID0gYXN5bmMoZnVuY3Rpb24qICgpIHtcbiAgICBsZXQgbm93ID0gbmV3IERhdGUoKTtcbiAgICB5aWVsZCB0aGlzLl9jb25uZWN0QW5kSW5pdCgpO1xuICAgIHlpZWxkIHRoaXMuX2xvY2tzQ29sbGVjdGlvbi5yZW1vdmUoXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhlbGRUbzoge1xuICAgICAgICAgICAgICAgICRsdDogbm93XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHsgdzogdGhpcy5fdy53IH1cbiAgICApO1xufSk7XG5cbi8vIFNUQVRFXG5cbk1vbmdvREJQZXJzaXN0ZW5jZS5wcm90b3R5cGUuaXNSdW5uaW5nID0gYXN5bmMoZnVuY3Rpb24qICh3b3JrZmxvd05hbWUsIGluc3RhbmNlSWQpIHtcbiAgICB5aWVsZCB0aGlzLl9jb25uZWN0QW5kSW5pdCgpO1xuXG4gICAgaW5zdGFuY2VJZCA9IGluc3RhbmNlSWQudG9TdHJpbmcoKTtcbiAgICBsZXQgciA9IHlpZWxkIHRoaXMuX3N0YXRlQ29sbGVjdGlvbi5maW5kT25lKFxuICAgICAgICB7IF9pZDogeyB3b3JrZmxvd05hbWU6IHdvcmtmbG93TmFtZSwgaW5zdGFuY2VJZDogaW5zdGFuY2VJZCB9IH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIHc6IHRoaXMuX3cudyxcbiAgICAgICAgICAgIGZpZWxkczogeyBfaWQ6IDEgfVxuICAgICAgICB9XG4gICAgKTtcblxuICAgIHJldHVybiAhIXI7XG59KTtcblxuTW9uZ29EQlBlcnNpc3RlbmNlLnByb3RvdHlwZS5wZXJzaXN0U3RhdGUgPSBhc3luYyhmdW5jdGlvbiogKHN0YXRlKSB7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgIHlpZWxkIHNlbGYuX2Nvbm5lY3RBbmRJbml0KCk7XG5cbiAgICBsZXQgaW5zdGFuY2VJZCA9IHN0YXRlLmluc3RhbmNlSWQudG9TdHJpbmcoKTtcblxuICAgIGZ1bmN0aW9uIHBlcnNpc3RTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHNlbGYuX3N0YXRlQ29sbGVjdGlvbi51cGRhdGUoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgX2lkOiB7XG4gICAgICAgICAgICAgICAgICAgIHdvcmtmbG93TmFtZTogc3RhdGUud29ya2Zsb3dOYW1lLFxuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZUlkOiBpbnN0YW5jZUlkXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB3b3JrZmxvd1ZlcnNpb246IHN0YXRlLndvcmtmbG93VmVyc2lvbixcbiAgICAgICAgICAgICAgICBjcmVhdGVkT246IHN0YXRlLmNyZWF0ZWRPbixcbiAgICAgICAgICAgICAgICB1cGRhdGVkT246IHN0YXRlLnVwZGF0ZWRPbixcbiAgICAgICAgICAgICAgICBhY3RpdmVEZWxheXM6IHN0YXRlLmFjdGl2ZURlbGF5cyB8fCBudWxsLFxuICAgICAgICAgICAgICAgIHN0YXRlOiBzZWxmLm9wdGlvbnMuc3RyaW5naWZ5U3RhdGUgPyBKU09OLnN0cmluZ2lmeShzdGF0ZS5zdGF0ZSkgOiBzdGF0ZS5zdGF0ZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB3OiBzZWxmLl93LncsXG4gICAgICAgICAgICAgICAgdXBzZXJ0OiB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKHN0YXRlLnByb21vdGVkUHJvcGVydGllcyAmJiBzZWxmLm9wdGlvbnMuZW5hYmxlUHJvbW90aW9ucykge1xuICAgICAgICB5aWVsZCBCbHVlYmlyZC5hbGwoW1xuICAgICAgICAgICAgcGVyc2lzdFN0YXRlKCksXG4gICAgICAgICAgICBzZWxmLl9wcm9tb3RlZFByb3BlcnRpZXNDb2xsZWN0aW9uLnVwZGF0ZShcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIF9pZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dOYW1lOiBzdGF0ZS53b3JrZmxvd05hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZUlkOiBpbnN0YW5jZUlkXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dWZXJzaW9uOiBzdGF0ZS53b3JrZmxvd1ZlcnNpb24sXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRPbjogc3RhdGUuY3JlYXRlZE9uLFxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVkT246IHN0YXRlLnVwZGF0ZWRPbixcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczogc3RhdGUucHJvbW90ZWRQcm9wZXJ0aWVzXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHc6IHNlbGYuX3cudyxcbiAgICAgICAgICAgICAgICAgICAgdXBzZXJ0OiB0cnVlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKVxuICAgICAgICBdKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHlpZWxkIHBlcnNpc3RTdGF0ZSgpO1xuICAgIH1cbn0pO1xuXG5Nb25nb0RCUGVyc2lzdGVuY2UucHJvdG90eXBlLmdldFJ1bm5pbmdJbnN0YW5jZUlkSGVhZGVyID0gYXN5bmMoZnVuY3Rpb24qICh3b3JrZmxvd05hbWUsIGluc3RhbmNlSWQpIHtcbiAgICB5aWVsZCB0aGlzLl9jb25uZWN0QW5kSW5pdCgpO1xuXG4gICAgaW5zdGFuY2VJZCA9IGluc3RhbmNlSWQudG9TdHJpbmcoKTtcblxuICAgIGxldCByZXN1bHQgPSB5aWVsZCB0aGlzLl9zdGF0ZUNvbGxlY3Rpb24uZmluZE9uZShcbiAgICAgICAge1xuICAgICAgICAgICAgX2lkOiB7XG4gICAgICAgICAgICAgICAgd29ya2Zsb3dOYW1lOiB3b3JrZmxvd05hbWUsXG4gICAgICAgICAgICAgICAgaW5zdGFuY2VJZDogaW5zdGFuY2VJZFxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICB3OiB0aGlzLl93LncsXG4gICAgICAgICAgICBmaWVsZHM6IHtcbiAgICAgICAgICAgICAgICBfaWQ6IDAsXG4gICAgICAgICAgICAgICAgdXBkYXRlZE9uOiAxLFxuICAgICAgICAgICAgICAgIHdvcmtmbG93VmVyc2lvbjogMVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHdvcmtmbG93TmFtZTogd29ya2Zsb3dOYW1lLFxuICAgICAgICBpbnN0YW5jZUlkOiBpbnN0YW5jZUlkLFxuICAgICAgICB1cGRhdGVkT246IHJlc3VsdC51cGRhdGVkT24sXG4gICAgICAgIHdvcmtmbG93VmVyc2lvbjogcmVzdWx0LndvcmtmbG93VmVyc2lvblxuICAgIH07XG59KTtcblxuTW9uZ29EQlBlcnNpc3RlbmNlLnByb3RvdHlwZS5sb2FkU3RhdGUgPSBhc3luYyhmdW5jdGlvbiogKHdvcmtmbG93TmFtZSwgaW5zdGFuY2VJZCkge1xuICAgIHlpZWxkIHRoaXMuX2Nvbm5lY3RBbmRJbml0KCk7XG5cbiAgICBpbnN0YW5jZUlkID0gaW5zdGFuY2VJZC50b1N0cmluZygpO1xuXG4gICAgbGV0IHIgPSB5aWVsZCB0aGlzLl9zdGF0ZUNvbGxlY3Rpb24uZmluZE9uZShcbiAgICAgICAge1xuICAgICAgICAgICAgX2lkOiB7XG4gICAgICAgICAgICAgICAgd29ya2Zsb3dOYW1lOiB3b3JrZmxvd05hbWUsXG4gICAgICAgICAgICAgICAgaW5zdGFuY2VJZDogaW5zdGFuY2VJZFxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICB3OiB0aGlzLl93LncsXG4gICAgICAgICAgICBmaWVsZHM6IHtcbiAgICAgICAgICAgICAgICBfaWQ6IDBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICk7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLnN0cmluZ2lmeVN0YXRlKSB7XG4gICAgICAgIHIuc3RhdGUgPSBKU09OLnBhcnNlKHIuc3RhdGUpO1xuICAgIH1cbiAgICByLndvcmtmbG93TmFtZSA9IHdvcmtmbG93TmFtZTtcbiAgICByLmluc3RhbmNlSWQgPSBpbnN0YW5jZUlkO1xuICAgIHJldHVybiByO1xufSk7XG5cbk1vbmdvREJQZXJzaXN0ZW5jZS5wcm90b3R5cGUucmVtb3ZlU3RhdGUgPSBhc3luYyhmdW5jdGlvbiogKHdvcmtmbG93TmFtZSwgaW5zdGFuY2VJZCkge1xuICAgIGxldCBzZWxmID0gdGhpcztcbiAgICB5aWVsZCBzZWxmLl9jb25uZWN0QW5kSW5pdCgpO1xuXG4gICAgaW5zdGFuY2VJZCA9IGluc3RhbmNlSWQudG9TdHJpbmcoKTtcblxuICAgIGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgICAgcmV0dXJuIHNlbGYuX3N0YXRlQ29sbGVjdGlvbi5yZW1vdmUoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgX2lkOiB7XG4gICAgICAgICAgICAgICAgICAgIHdvcmtmbG93TmFtZTogd29ya2Zsb3dOYW1lLFxuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZUlkOiBpbnN0YW5jZUlkXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHsgdzogc2VsZi5fdy53IH1cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAoc2VsZi5vcHRpb25zLmVuYWJsZVByb21vdGlvbnMpIHtcbiAgICAgICAgeWllbGQgQmx1ZWJpcmQuYWxsKFtcbiAgICAgICAgICAgIHJlbW92ZSgpLFxuICAgICAgICAgICAgc2VsZi5fcHJvbW90ZWRQcm9wZXJ0aWVzQ29sbGVjdGlvbi5yZW1vdmUoXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBfaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93TmFtZTogd29ya2Zsb3dOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VJZDogaW5zdGFuY2VJZFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7IHc6IHNlbGYuX3cudyB9XG4gICAgICAgICAgICApXG4gICAgICAgIF0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgeWllbGQgcmVtb3ZlKCk7XG4gICAgfVxufSk7XG5cbk1vbmdvREJQZXJzaXN0ZW5jZS5wcm90b3R5cGUubG9hZFByb21vdGVkUHJvcGVydGllcyA9IGFzeW5jKGZ1bmN0aW9uKiAod29ya2Zsb3dOYW1lLCBpbnN0YW5jZUlkKSB7XG4gICAgaWYgKCF0aGlzLm9wdGlvbnMuZW5hYmxlUHJvbW90aW9ucykge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB5aWVsZCB0aGlzLl9jb25uZWN0QW5kSW5pdCgpO1xuXG4gICAgaW5zdGFuY2VJZCA9IGluc3RhbmNlSWQudG9TdHJpbmcoKTtcblxuICAgIGxldCBwcCA9IHlpZWxkIHRoaXMuX3Byb21vdGVkUHJvcGVydGllc0NvbGxlY3Rpb24uZmluZE9uZShcbiAgICAgICAge1xuICAgICAgICAgICAgX2lkOiB7XG4gICAgICAgICAgICAgICAgd29ya2Zsb3dOYW1lOiB3b3JrZmxvd05hbWUsXG4gICAgICAgICAgICAgICAgaW5zdGFuY2VJZDogaW5zdGFuY2VJZFxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICB3OiB0aGlzLl93LncsXG4gICAgICAgICAgICBmaWVsZHM6IHtcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiAxXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICApO1xuXG4gICAgcmV0dXJuIHBwID8gcHAucHJvcGVydGllcyA6IG51bGw7XG59KTtcblxuTW9uZ29EQlBlcnNpc3RlbmNlLnByb3RvdHlwZS5nZXROZXh0V2FrZXVwYWJsZXMgPSBhc3luYyhmdW5jdGlvbiogKGNvdW50KSB7XG4gICAgeWllbGQgdGhpcy5fY29ubmVjdEFuZEluaXQoKTtcblxuICAgIGxldCByZXN1bHQgPSB5aWVsZCB0aGlzLl9zdGF0ZUNvbGxlY3Rpb25cbiAgICAgICAgLmFnZ3JlZ2F0ZShbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgJG1hdGNoOiB7XG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZURlbGF5czogeyAkbmU6IG51bGwgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgJHByb2plY3Q6IHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlRGVsYXlzOiAxXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHsgJHVud2luZDogXCIkYWN0aXZlRGVsYXlzXCIgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAkc29ydDoge1xuICAgICAgICAgICAgICAgICAgICB1cGRhdGVkT246IDEsXG4gICAgICAgICAgICAgICAgICAgIFwiYWN0aXZlRGVsYXlzLmRlbGF5VG9cIjogMVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7ICRsaW1pdDogY291bnQgfVxuICAgICAgICBdKVxuICAgICAgICAudG9BcnJheSgpO1xuXG4gICAgcmV0dXJuIHJlc3VsdC5tYXAoZnVuY3Rpb24ocikge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaW5zdGFuY2VJZDogci5faWQuaW5zdGFuY2VJZCxcbiAgICAgICAgICAgIHdvcmtmbG93TmFtZTogci5faWQud29ya2Zsb3dOYW1lLFxuICAgICAgICAgICAgYWN0aXZlRGVsYXk6IHtcbiAgICAgICAgICAgICAgICBtZXRob2ROYW1lOiByLmFjdGl2ZURlbGF5cy5tZXRob2ROYW1lLFxuICAgICAgICAgICAgICAgIGRlbGF5VG86IHIuYWN0aXZlRGVsYXlzLmRlbGF5VG9cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9KTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1vbmdvREJQZXJzaXN0ZW5jZTtcbiJdfQ==
