"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var measure_1 = require("./measure");
var MeasureFixtures = (function () {
    function MeasureFixtures() {
    }
    MeasureFixtures.wikiCountJS = function () {
        return {
            name: "count",
            title: "Count",
            formula: "$main.sum($count)"
        };
    };
    MeasureFixtures.previousWikiCountJS = function () {
        return {
            name: "_previous__count",
            title: "Count",
            formula: "$main.sum($count)"
        };
    };
    MeasureFixtures.deltaWikiCountJS = function () {
        return {
            name: "_delta__count",
            title: "Count",
            formula: "$main.sum($count)"
        };
    };
    MeasureFixtures.wikiCount = function () {
        return new measure_1.Measure({
            name: "count",
            title: "Count",
            formula: "$main.sum($count)"
        });
    };
    MeasureFixtures.wikiUniqueUsersJS = function () {
        return {
            name: "unique_users",
            title: "Unique Users",
            formula: "$main.countDistinct($unique_users)"
        };
    };
    MeasureFixtures.wikiUniqueUsers = function () {
        return new measure_1.Measure({
            name: "unique_users",
            title: "Unique Users",
            formula: "$main.countDistinct($unique_users)"
        });
    };
    MeasureFixtures.twitterCount = function () {
        return measure_1.Measure.fromJS({
            name: "count",
            formula: "$main.count()"
        });
    };
    MeasureFixtures.noTransformationMeasure = function () {
        return measure_1.Measure.fromJS({
            name: "items_measure",
            formula: "$main.sum($item)"
        });
    };
    MeasureFixtures.percentOfParentMeasure = function () {
        return measure_1.Measure.fromJS({
            name: "items_measure",
            formula: "$main.sum($item)",
            transformation: "percent-of-parent"
        });
    };
    MeasureFixtures.percentOfTotalMeasure = function () {
        return measure_1.Measure.fromJS({
            name: "items_measure",
            formula: "$main.sum($item)",
            transformation: "percent-of-total"
        });
    };
    MeasureFixtures.applyWithNoTransformation = function () {
        return {
            expression: {
                expression: {
                    name: "item",
                    op: "ref"
                },
                op: "sum",
                operand: {
                    name: "main",
                    op: "ref"
                }
            },
            name: "items_measure",
            op: "apply"
        };
    };
    MeasureFixtures.applyWithTransformationAtRootLevel = function () {
        return {
            expression: {
                expression: {
                    name: "item",
                    op: "ref"
                },
                op: "sum",
                operand: {
                    name: "main",
                    op: "ref"
                }
            },
            name: "__formula_items_measure",
            op: "apply"
        };
    };
    MeasureFixtures.applyWithTransformationAtLevel = function (level) {
        return {
            expression: {
                expression: {
                    op: "literal",
                    value: 100
                },
                op: "multiply",
                operand: {
                    expression: {
                        name: "__formula_items_measure",
                        nest: level,
                        op: "ref"
                    },
                    op: "divide",
                    operand: {
                        name: "__formula_items_measure",
                        op: "ref"
                    }
                }
            },
            name: "items_measure",
            op: "apply",
            operand: {
                expression: {
                    expression: {
                        name: "item",
                        op: "ref"
                    },
                    op: "sum",
                    operand: {
                        name: "main",
                        op: "ref"
                    }
                },
                name: "__formula_items_measure",
                op: "apply"
            }
        };
    };
    return MeasureFixtures;
}());
exports.MeasureFixtures = MeasureFixtures;
//# sourceMappingURL=measure.fixtures.js.map