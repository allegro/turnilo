"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var measure_group_fixtures_1 = require("./measure-group.fixtures");
var measure_fixtures_1 = require("./measure.fixtures");
var MeasuresFixtures = (function () {
    function MeasuresFixtures() {
    }
    MeasuresFixtures.wikiNames = function () {
        return ["count", "added", "avg_added", "delta", "avg_delta"];
    };
    MeasuresFixtures.wikiTitles = function () {
        return ["Count", "Added", "Avg Added", "Delta", "Avg Delta"];
    };
    MeasuresFixtures.wikiJS = function () {
        return [
            measure_fixtures_1.MeasureFixtures.wikiCountJS(),
            {
                name: "other",
                title: "Other",
                measures: [
                    measure_group_fixtures_1.MeasureGroupFixtures.wikiAddedJS(),
                    measure_group_fixtures_1.MeasureGroupFixtures.wikiDeltaJS()
                ]
            }
        ];
    };
    MeasuresFixtures.twitterJS = function () {
        return [
            {
                name: "count",
                title: "count",
                formula: "$main.count()"
            }
        ];
    };
    return MeasuresFixtures;
}());
exports.MeasuresFixtures = MeasuresFixtures;
//# sourceMappingURL=measures.fixtures.js.map