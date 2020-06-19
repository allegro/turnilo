"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var timekeeper_1 = require("../../models/timekeeper/timekeeper");
var TimeMonitor = (function () {
    function TimeMonitor(logger) {
        var _this = this;
        this.doingChecks = false;
        this.doCheck = function (_a) {
            var name = _a.name;
            var _b = _this, logger = _b.logger, checks = _b.checks;
            var check = checks.get(name);
            if (!check)
                return Promise.resolve(null);
            return check().then(function (updatedTime) {
                logger.log("Got the latest time for '" + name + "' (" + updatedTime.toISOString() + ")");
                _this.timekeeper = _this.timekeeper.updateTime(name, updatedTime);
            }).catch(function (e) {
                logger.error("Error getting time for '" + name + "': " + e.message);
            });
        };
        this.isStale = function (timeTag) {
            var _a = _this, timekeeper = _a.timekeeper, regularCheckInterval = _a.regularCheckInterval;
            var now = timekeeper.now().valueOf();
            return !timeTag.time || now - timeTag.updated.valueOf() > regularCheckInterval;
        };
        this.doChecks = function () {
            var _a = _this, doingChecks = _a.doingChecks, timekeeper = _a.timekeeper;
            if (doingChecks)
                return;
            var timeTags = timekeeper.timeTags;
            _this.doingChecks = true;
            var checkTasks = timeTags.filter(_this.isStale).map(_this.doCheck);
            Promise.all(checkTasks).then(function () {
                _this.doingChecks = false;
            });
        };
        this.logger = logger;
        this.checks = new Map();
        this.regularCheckInterval = 60000;
        this.specialCheckInterval = 60000;
        this.timekeeper = timekeeper_1.Timekeeper.EMPTY;
        setInterval(this.doChecks, 1000);
    }
    TimeMonitor.prototype.removeCheck = function (name) {
        this.checks.delete(name);
        this.timekeeper = this.timekeeper.removeTimeTagFor(name);
        return this;
    };
    TimeMonitor.prototype.addCheck = function (name, check) {
        this.checks.set(name, check);
        this.timekeeper = this.timekeeper.addTimeTagFor(name);
        return this;
    };
    return TimeMonitor;
}());
exports.TimeMonitor = TimeMonitor;
//# sourceMappingURL=time-monitor.js.map