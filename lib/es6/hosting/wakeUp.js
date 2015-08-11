"use strict";

let EventEmitter = require("events").EventEmitter;
let Bluebird = require("bluebird");
let async = require("../common").asyncHelpers.async;
let debug = require("debug")("wf4node:WakeUp");
let util = require("util");

function WakeUp(knownInstaStore, persistence, options) {
    EventEmitter.call(this);

    this.knownInstaStore = knownInstaStore;
    this.persistence = persistence;
    this.options = options || {};
    this._working = false;
    this._interval = null;
}

util.inherits(WakeUp, EventEmitter);

WakeUp.prototype.start = function () {
    if (!this._interval) {
        debug("Start.");
        let self = this;
        this._interval = setInterval(function () { self._step(); }, this.options.interval || 5000);
    }
};

WakeUp.prototype.stop = function () {
    if (this._interval) {
        debug("Stop.");
        clearInterval(this._interval);
        this._interval = null;
    }
};

WakeUp.prototype._step = async(function*() {
    if (this._working) {
        debug("Skipping current step because work in progress.");
        return;
    }
    debug("Starting next step.");
    this._working = true;
    try {
        let wakeupable = yield this._getNextWakeupable();
        if (wakeupable) {
            debug("Waking up workflow %s, id: %s", wakeupable.workflowName, wakeupable.instanceId);
            wakeupable.result = {};
            let promise = new Bluebird(function (resolve, reject) {
                wakeupable.result.resolve = resolve;
                wakeupable.result.reject = reject;
            });
            try {
                yield promise;
                debug("Processing delay completed.");
            }
            catch (e) {
                debug("Processing delay error: %s", e.stack);
            }
        }
    }
    catch (e) {
        this.emit("error", e);
    }
    finally {
        debug("Next step completed.");
        this._working = false;
    }
});

WakeUp.prototype._getNextWakeupable = async(function* () {
    if (this.persistence) {
        return yield this.persistence.getNextWakeupable();
    }
    else {
        return yield this.knownInstaStore.getNextWakeupable();
    }
});

module.exports = WakeUp;