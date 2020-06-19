"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var immutable_1 = require("immutable");
var plywood_1 = require("plywood");
var filter_clause_1 = require("../filter-clause/filter-clause");
var FilterMode;
(function (FilterMode) {
    FilterMode["EXCLUDE"] = "exclude";
    FilterMode["INCLUDE"] = "include";
    FilterMode["REGEX"] = "regex";
    FilterMode["CONTAINS"] = "contains";
})(FilterMode = exports.FilterMode || (exports.FilterMode = {}));
var defaultFilter = { clauses: immutable_1.List([]) };
var Filter = (function (_super) {
    __extends(Filter, _super);
    function Filter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Filter.fromClause = function (clause) {
        return this.fromClauses([clause]);
    };
    Filter.fromClauses = function (clauses) {
        if (!clauses)
            throw new Error("must have clause");
        return new Filter({ clauses: immutable_1.List(clauses) });
    };
    Filter.fromJS = function (definition) {
        return new Filter({
            clauses: immutable_1.List(definition.clauses.map(function (def) { return filter_clause_1.fromJS(def); }))
        });
    };
    Filter.prototype.updateClauses = function (updater) {
        return this.update("clauses", updater);
    };
    Filter.prototype.toString = function () {
        return this.clauses.map(function (clause) { return clause.toString(); }).join(" and ");
    };
    Filter.prototype.replaceByIndex = function (index, newClause) {
        if (this.length() === index) {
            return this.insertByIndex(index, newClause);
        }
        return this.updateClauses(function (clauses) {
            var newClauseIndex = clauses.findIndex(function (clause) { return clause.equals(newClause); });
            if (newClauseIndex === -1)
                return clauses.set(index, newClause);
            var oldClause = clauses.get(index);
            return clauses
                .set(index, newClause)
                .set(newClauseIndex, oldClause);
        });
    };
    Filter.prototype.insertByIndex = function (index, newClause) {
        return this.updateClauses(function (clauses) {
            return clauses
                .insert(index, newClause)
                .filterNot(function (c, i) { return c.equals(newClause) && i !== index; });
        });
    };
    Filter.prototype.empty = function () {
        return this.clauses.count() === 0;
    };
    Filter.prototype.single = function () {
        return this.clauses.count() === 1;
    };
    Filter.prototype.length = function () {
        return this.clauses.count();
    };
    Filter.prototype.toExpression = function (dataCube) {
        var clauses = this.clauses.toArray().map(function (clause) { return filter_clause_1.toExpression(clause, dataCube.getDimension(clause.reference)); });
        switch (clauses.length) {
            case 0:
                return plywood_1.Expression.TRUE;
            case 1:
                return clauses[0];
            default:
                return plywood_1.Expression.and(clauses);
        }
    };
    Filter.prototype.isRelative = function () {
        return this.clauses.some(function (clause) { return clause instanceof filter_clause_1.RelativeTimeFilterClause; });
    };
    Filter.prototype.getSpecificFilter = function (now, maxTime, timezone) {
        if (!this.isRelative())
            return this;
        return this.updateClauses(function (clauses) {
            return clauses.map(function (clause) {
                if (clause instanceof filter_clause_1.RelativeTimeFilterClause) {
                    return clause.evaluate(now, maxTime, timezone);
                }
                return clause;
            });
        });
    };
    Filter.prototype.indexOfClause = function (reference) {
        return this.clauses.findIndex(function (clause) { return clause.reference === reference; });
    };
    Filter.prototype.clauseForReference = function (reference) {
        return this.clauses.find(function (clause) { return clause.reference === reference; });
    };
    Filter.prototype.addClause = function (clause) {
        return this.updateClauses(function (clauses) { return clauses.push(clause); });
    };
    Filter.prototype.removeClause = function (reference) {
        var index = this.indexOfClause(reference);
        if (index === -1)
            return this;
        return this.updateClauses(function (clauses) { return clauses.delete(index); });
    };
    Filter.prototype.filteredOn = function (reference) {
        return this.indexOfClause(reference) !== -1;
    };
    Filter.prototype.getClauseForDimension = function (_a) {
        var name = _a.name;
        return this.clauses.find(function (clause) { return clause.reference === name; });
    };
    Filter.prototype.getModeForDimension = function (_a) {
        var name = _a.name;
        var dimensionClauses = this.clauses.filter(function (clause) { return clause.reference === name; });
        if (dimensionClauses.size > 0) {
            if (dimensionClauses.every(function (clause) {
                return clause instanceof filter_clause_1.StringFilterClause && clause.action === filter_clause_1.StringFilterAction.MATCH;
            })) {
                return FilterMode.REGEX;
            }
            if (dimensionClauses.every(function (clause) {
                return clause instanceof filter_clause_1.StringFilterClause && clause.action === filter_clause_1.StringFilterAction.CONTAINS;
            })) {
                return FilterMode.CONTAINS;
            }
            if (dimensionClauses.every(function (clause) { return clause.not; })) {
                return FilterMode.EXCLUDE;
            }
            return FilterMode.INCLUDE;
        }
        return undefined;
    };
    Filter.prototype.setClause = function (newClause) {
        var idx = this.clauses.findIndex(function (clause) { return clause.reference === newClause.reference; });
        return this.updateClauses(function (clauses) { return idx === -1 ? clauses.concat([newClause]) : clauses.set(idx, newClause); });
    };
    Filter.prototype.mergeClauses = function (clauses) {
        return clauses.reduce(function (filter, deltaClause) { return filter.setClause(deltaClause); }, this);
    };
    Filter.prototype.constrainToDimensions = function (dimensions) {
        return this.updateClauses(function (clauses) {
            return clauses.filter(function (clause) { return dimensions.getDimensionByName(clause.reference); });
        });
    };
    Filter.prototype.setExclusionForDimension = function (exclusion, _a) {
        var name = _a.name;
        return this.updateClauses(function (clauses) {
            var idx = clauses.findIndex(function (clause) { return clause.reference === name; });
            if (idx === -1)
                return clauses;
            return clauses.setIn([idx, "not"], exclusion);
        });
    };
    return Filter;
}(immutable_1.Record(defaultFilter)));
exports.Filter = Filter;
exports.EMPTY_FILTER = new Filter({});
//# sourceMappingURL=filter.js.map