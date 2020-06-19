"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var plywood_1 = require("plywood");
var outputFunctions = {
    json: function (data) { return JSON.stringify(data, null, 2); },
    csv: function (data) { return data.toCSV(); },
    tsv: function (data) { return data.toTSV(); }
};
function plyqlRouter(settingsGetter) {
    var _this = this;
    var router = express_1.Router();
    router.post("/", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var query, outputType, parsedSQL, outputFn, parsedQuery, dataCube, settings, myDataCube, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    query = req.body.query;
                    outputType = req.body.outputType;
                    if (typeof query !== "string") {
                        res.status(400).send("Query must be a string");
                        return [2];
                    }
                    try {
                        parsedSQL = plywood_1.Expression.parseSQL(query);
                    }
                    catch (e) {
                        res.status(400).send("Could not parse query as SQL: " + e.message);
                        return [2];
                    }
                    if (typeof outputType !== "string") {
                        outputType = "json";
                    }
                    outputFn = outputFunctions[outputType];
                    if (outputFn === undefined) {
                        res.status(400).send("Invalid output type: " + outputType);
                        return [2];
                    }
                    parsedQuery = parsedSQL.expression;
                    dataCube = parsedSQL.table;
                    if (!dataCube) {
                        res.status(400).send("Could not determine data cube name");
                        return [2];
                    }
                    parsedQuery = parsedQuery.substitute(function (ex) {
                        if (ex instanceof plywood_1.RefExpression && ex.name === dataCube) {
                            return plywood_1.$("main");
                        }
                        return null;
                    });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4, settingsGetter({ dataCubeOfInterest: dataCube })];
                case 2:
                    settings = _a.sent();
                    myDataCube = settings.getDataCube(dataCube);
                    if (!myDataCube) {
                        res.status(400).send({ error: "unknown data cube" });
                        return [2];
                    }
                    return [4, myDataCube.executor(parsedQuery)];
                case 3:
                    data = _a.sent();
                    res.type(outputType);
                    res.send(outputFn(plywood_1.Dataset.fromJS(data.toJS())));
                    return [3, 5];
                case 4:
                    error_1 = _a.sent();
                    res.status(500).send("got error " + error_1.message);
                    return [3, 5];
                case 5: return [2];
            }
        });
    }); });
    return router;
}
exports.plyqlRouter = plyqlRouter;
//# sourceMappingURL=plyql.js.map