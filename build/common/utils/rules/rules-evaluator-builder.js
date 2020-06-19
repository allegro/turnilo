"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var RulesEvaluatorBuilder = (function () {
    function RulesEvaluatorBuilder(rules, partialRule, otherwiseAction) {
        this.partialRule = partialRule;
        this.otherwiseAction = otherwiseAction;
        this.rules = rules || [];
    }
    RulesEvaluatorBuilder.empty = function () {
        return new RulesEvaluatorBuilder();
    };
    RulesEvaluatorBuilder.prototype.when = function (predicate) {
        var rules = this.rules;
        var partialRule = { predicates: [predicate] };
        return new RulesEvaluatorBuilder(rules, partialRule);
    };
    RulesEvaluatorBuilder.prototype.or = function (predicate) {
        var _a = this, rules = _a.rules, partialRule = _a.partialRule;
        var newPartialRule = { predicates: partialRule.predicates.concat([predicate]) };
        return new RulesEvaluatorBuilder(rules, newPartialRule);
    };
    RulesEvaluatorBuilder.prototype.then = function (action) {
        var _a = this, rules = _a.rules, partialRule = _a.partialRule;
        var newRule = __assign({}, partialRule, { action: action });
        return new RulesEvaluatorBuilder(rules.concat([newRule]));
    };
    RulesEvaluatorBuilder.prototype.otherwise = function (action) {
        var rules = this.rules;
        return new RulesEvaluatorBuilder(rules, undefined, action);
    };
    RulesEvaluatorBuilder.prototype.build = function () {
        var _this = this;
        return function (variables) {
            for (var _i = 0, _a = _this.rules; _i < _a.length; _i++) {
                var rule = _a[_i];
                var predicates = rule.predicates, action = rule.action;
                if (predicates.some(function (predicate) { return predicate(variables); })) {
                    return action(variables);
                }
            }
            return _this.otherwiseAction(variables);
        };
    };
    return RulesEvaluatorBuilder;
}());
exports.RulesEvaluatorBuilder = RulesEvaluatorBuilder;
//# sourceMappingURL=rules-evaluator-builder.js.map