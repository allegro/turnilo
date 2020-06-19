"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dimension_1 = require("./dimension");
var DimensionFixtures = (function () {
    function DimensionFixtures() {
    }
    Object.defineProperty(DimensionFixtures, "COUNTRY_STRING_JS", {
        get: function () {
            return {
                name: "country",
                title: "important countries",
                formula: "$country",
                kind: "string"
            };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DimensionFixtures, "COUNTRY_URL_JS", {
        get: function () {
            return {
                name: "country",
                title: "important countries",
                formula: "$country",
                kind: "string",
                url: "https://www.country.com/%s"
            };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DimensionFixtures, "TIME_JS", {
        get: function () {
            return {
                name: "time",
                title: "time",
                formula: "$time",
                kind: "time",
                url: "http://www.time.com/%s"
            };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DimensionFixtures, "NUMBER_JS", {
        get: function () {
            return {
                name: "numeric",
                title: "Numeric",
                formula: "$n",
                kind: "number"
            };
        },
        enumerable: true,
        configurable: true
    });
    DimensionFixtures.wikiTimeJS = function () {
        return {
            name: "time",
            title: "Time",
            formula: "$time",
            kind: "time"
        };
    };
    DimensionFixtures.wikiCommentLengthJS = function () {
        return {
            name: "commentLength",
            title: "Comment Length",
            formula: "$commentLength",
            kind: "number"
        };
    };
    DimensionFixtures.wikiTime = function () {
        return new dimension_1.Dimension({
            name: "time",
            title: "Time",
            formula: "$time",
            kind: "time"
        });
    };
    DimensionFixtures.wikiIsRobot = function () {
        return new dimension_1.Dimension({
            name: "isRobot",
            title: "Is Robot",
            formula: "$isRobot",
            kind: "boolean"
        });
    };
    DimensionFixtures.wikiChannel = function () {
        return new dimension_1.Dimension({
            name: "channel",
            title: "Channel",
            formula: "$channel"
        });
    };
    DimensionFixtures.countryString = function () {
        return dimension_1.Dimension.fromJS(DimensionFixtures.COUNTRY_STRING_JS);
    };
    DimensionFixtures.countryURL = function () {
        return dimension_1.Dimension.fromJS(DimensionFixtures.COUNTRY_URL_JS);
    };
    DimensionFixtures.time = function () {
        return dimension_1.Dimension.fromJS(DimensionFixtures.TIME_JS);
    };
    DimensionFixtures.number = function () {
        return dimension_1.Dimension.fromJS(DimensionFixtures.NUMBER_JS);
    };
    DimensionFixtures.wikiCommentLength = function () {
        return dimension_1.Dimension.fromJS(DimensionFixtures.wikiCommentLengthJS());
    };
    return DimensionFixtures;
}());
exports.DimensionFixtures = DimensionFixtures;
//# sourceMappingURL=dimension.fixtures.js.map