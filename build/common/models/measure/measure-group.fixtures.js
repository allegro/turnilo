"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var measure_fixtures_1 = require("./measure.fixtures");
var MeasureGroupFixtures = (function () {
    function MeasureGroupFixtures() {
    }
    MeasureGroupFixtures.noTitleJS = function () {
        return {
            name: "dummyName",
            measures: [
                measure_fixtures_1.MeasureFixtures.wikiCountJS()
            ]
        };
    };
    MeasureGroupFixtures.withTitleInferredJS = function () {
        return {
            name: "dummyName",
            title: "Dummy Name",
            measures: [
                measure_fixtures_1.MeasureFixtures.wikiCountJS()
            ]
        };
    };
    MeasureGroupFixtures.noNameJS = function () {
        return {
            measures: [measure_fixtures_1.MeasureFixtures.wikiCountJS()]
        };
    };
    MeasureGroupFixtures.noMeasuresJS = function () {
        return {
            name: "dummyName"
        };
    };
    MeasureGroupFixtures.emptyMeasuresJS = function () {
        return {
            name: "dummyName",
            measures: []
        };
    };
    MeasureGroupFixtures.wikiAddedJS = function () {
        return {
            name: "added_group",
            title: "Added Group",
            measures: [
                {
                    name: "added",
                    title: "Added",
                    formula: "$main.sum($added)"
                },
                {
                    name: "avg_added",
                    title: "Avg Added",
                    formula: "$main.average($added)"
                }
            ]
        };
    };
    MeasureGroupFixtures.wikiDeltaJS = function () {
        return {
            name: "delta_group",
            title: "Delta Group",
            measures: [
                {
                    name: "delta",
                    title: "Delta",
                    formula: "$main.sum($delta)"
                },
                {
                    name: "avg_delta",
                    title: "Avg Delta",
                    formula: "$main.average($delta)"
                }
            ]
        };
    };
    return MeasureGroupFixtures;
}());
exports.MeasureGroupFixtures = MeasureGroupFixtures;
//# sourceMappingURL=measure-group.fixtures.js.map