"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var check;
var RefreshRule = (function () {
    function RefreshRule(parameters) {
        var rule = parameters.rule;
        if (rule !== RefreshRule.FIXED && rule !== RefreshRule.QUERY && rule !== RefreshRule.REALTIME) {
            throw new Error("rule must be on of: " + RefreshRule.FIXED + ", " + RefreshRule.QUERY + ", or " + RefreshRule.REALTIME);
        }
        this.rule = rule;
        this.time = parameters.time;
    }
    RefreshRule.isRefreshRule = function (candidate) {
        return candidate instanceof RefreshRule;
    };
    RefreshRule.query = function () {
        return new RefreshRule({
            rule: RefreshRule.QUERY
        });
    };
    RefreshRule.fromJS = function (parameters) {
        var value = {
            rule: parameters.rule
        };
        if (parameters.time) {
            value.time = new Date(parameters.time);
        }
        return new RefreshRule(value);
    };
    RefreshRule.prototype.valueOf = function () {
        var value = {
            rule: this.rule
        };
        if (this.time) {
            value.time = this.time;
        }
        return value;
    };
    RefreshRule.prototype.toJS = function () {
        var js = {
            rule: this.rule
        };
        if (this.time) {
            js.time = this.time;
        }
        return js;
    };
    RefreshRule.prototype.toJSON = function () {
        return this.toJS();
    };
    RefreshRule.prototype.toString = function () {
        return "[RefreshRule: " + this.rule + "]";
    };
    RefreshRule.prototype.equals = function (other) {
        return RefreshRule.isRefreshRule(other) &&
            this.rule === other.rule &&
            (!this.time || this.time.valueOf() === other.time.valueOf());
    };
    RefreshRule.prototype.isFixed = function () {
        return this.rule === RefreshRule.FIXED;
    };
    RefreshRule.prototype.isQuery = function () {
        return this.rule === RefreshRule.QUERY;
    };
    RefreshRule.prototype.isRealtime = function () {
        return this.rule === RefreshRule.REALTIME;
    };
    RefreshRule.FIXED = "fixed";
    RefreshRule.QUERY = "query";
    RefreshRule.REALTIME = "realtime";
    return RefreshRule;
}());
exports.RefreshRule = RefreshRule;
check = RefreshRule;
//# sourceMappingURL=refresh-rule.js.map