"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dimension_fixtures_1 = require("./dimension.fixtures");
var DimensionGroupFixtures = (function () {
    function DimensionGroupFixtures() {
    }
    DimensionGroupFixtures.noTitleJS = function () {
        return {
            name: "dummyName",
            dimensions: [
                dimension_fixtures_1.DimensionFixtures.wikiTimeJS()
            ]
        };
    };
    DimensionGroupFixtures.withTitleInferredJS = function () {
        return {
            name: "dummyName",
            title: "Dummy Name",
            dimensions: [
                dimension_fixtures_1.DimensionFixtures.wikiTimeJS()
            ]
        };
    };
    DimensionGroupFixtures.noNameJS = function () {
        return {
            dimensions: [dimension_fixtures_1.DimensionFixtures.wikiTimeJS()]
        };
    };
    DimensionGroupFixtures.noDimensionsJS = function () {
        return {
            name: "dummyName"
        };
    };
    DimensionGroupFixtures.emptyDimensionsJS = function () {
        return {
            name: "dummyName",
            dimensions: []
        };
    };
    DimensionGroupFixtures.commentsJS = function () {
        return {
            name: "comment_group",
            title: "Comment Group",
            dimensions: [
                {
                    kind: "string",
                    name: "comment",
                    title: "Comment",
                    formula: "$comment"
                },
                {
                    kind: "number",
                    name: "commentLength",
                    title: "Comment Length",
                    formula: "$commentLength"
                },
                {
                    kind: "boolean",
                    name: "commentLengthOver100",
                    title: "Comment Length Over 100",
                    formula: "$commentLength > 100"
                }
            ]
        };
    };
    return DimensionGroupFixtures;
}());
exports.DimensionGroupFixtures = DimensionGroupFixtures;
//# sourceMappingURL=dimension-group.fixtures.js.map