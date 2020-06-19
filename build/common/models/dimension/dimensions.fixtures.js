"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dimension_group_fixtures_1 = require("./dimension-group.fixtures");
var dimension_fixtures_1 = require("./dimension.fixtures");
var DimensionsFixtures = (function () {
    function DimensionsFixtures() {
    }
    DimensionsFixtures.wikiNames = function () {
        return ["time", "country", "channel", "comment", "commentLength", "commentLengthOver100", "isRobot", "namespace", "articleName", "page", "page_last_author", "userChars"];
    };
    DimensionsFixtures.wikiTitles = function () {
        return ["Time", "Country", "Channel", "Comment", "Comment Length", "Comment Length Over 100", "Is Robot", "Namespace", "Article Name", "Page", "Page Author", "User Chars"];
    };
    DimensionsFixtures.wikiJS = function () {
        return [
            dimension_fixtures_1.DimensionFixtures.wikiTimeJS(),
            {
                kind: "string",
                name: "country",
                title: "Country",
                formula: "$country"
            },
            {
                kind: "string",
                name: "channel",
                title: "Channel",
                formula: "$channel"
            },
            dimension_group_fixtures_1.DimensionGroupFixtures.commentsJS(),
            {
                kind: "string",
                name: "isRobot",
                title: "Is Robot",
                formula: "$isRobot"
            },
            {
                kind: "string",
                name: "namespace",
                title: "Namespace",
                formula: "$namespace"
            },
            {
                kind: "string",
                name: "articleName",
                title: "Article Name",
                formula: "$articleName"
            },
            {
                kind: "string",
                name: "page",
                title: "Page",
                formula: "$page"
            },
            {
                kind: "string",
                name: "page_last_author",
                title: "Page Author",
                formula: "$page.lookup(page_last_author)"
            },
            {
                kind: "string",
                name: "userChars",
                title: "User Chars",
                formula: "$userChars"
            }
        ];
    };
    DimensionsFixtures.twitterJS = function () {
        return [
            {
                kind: "time",
                name: "time",
                title: "Time",
                formula: "$time"
            },
            {
                kind: "string",
                name: "twitterHandle",
                title: "Twitter Handle",
                formula: "$twitterHandle"
            },
            {
                kind: "number",
                name: "tweetLength",
                title: "Tweet Length",
                formula: "$tweetLength"
            }
        ];
    };
    return DimensionsFixtures;
}());
exports.DimensionsFixtures = DimensionsFixtures;
//# sourceMappingURL=dimensions.fixtures.js.map