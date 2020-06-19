"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var d3 = require("d3");
function parseCSV(text) {
    return d3.csv.parse(text);
}
exports.parseCSV = parseCSV;
function parseTSV(text) {
    return d3.tsv.parse(text);
}
exports.parseTSV = parseTSV;
function parseJSON(text) {
    text = text.trim();
    var firstChar = text[0];
    if (firstChar[0] === "[") {
        try {
            return JSON.parse(text);
        }
        catch (e) {
            throw new Error("could not parse");
        }
    }
    else if (firstChar[0] === "{") {
        return text.split(/\r?\n/).map(function (line, i) {
            try {
                return JSON.parse(line);
            }
            catch (e) {
                throw new Error("problem in line: " + i + ": '" + line + "'");
            }
        });
    }
    else {
        throw new Error("Unsupported start, starts with '" + firstChar[0] + "'");
    }
}
exports.parseJSON = parseJSON;
function parseData(text, type) {
    type = type.replace(".", "");
    switch (type) {
        case "csv":
        case "text/csv":
            return parseCSV(text);
        case "tsv":
        case "text/tsv":
        case "text/tab-separated-values":
            return parseTSV(text);
        case "json":
        case "application/json":
            return parseJSON(text);
        default:
            throw new Error("Unsupported file type '" + type + "'");
    }
}
exports.parseData = parseData;
//# sourceMappingURL=parser.js.map