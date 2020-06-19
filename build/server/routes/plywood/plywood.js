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
var chronoshift_1 = require("chronoshift");
var express_1 = require("express");
var plywood_1 = require("plywood");
var datacube_guard_1 = require("../../utils/datacube-guard/datacube-guard");
function plywoodRouter(getSettings) {
    var _this = this;
    var router = express_1.Router();
    router.post("/", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var _a, dataSource, expression, timezone, dataCube, queryTimezone, ex, settings, e_1, myDataCube, maxQueries, data, reply, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = req.body, dataSource = _a.dataSource, expression = _a.expression, timezone = _a.timezone;
                    dataCube = req.body.dataCube || dataSource;
                    if (typeof dataCube !== "string") {
                        res.status(400).send({
                            error: "must have a dataCube"
                        });
                        return [2];
                    }
                    queryTimezone = null;
                    if (typeof timezone === "string") {
                        try {
                            queryTimezone = chronoshift_1.Timezone.fromJS(timezone);
                        }
                        catch (e) {
                            res.status(400).send({
                                error: "bad timezone",
                                message: e.message
                            });
                            return [2];
                        }
                    }
                    ex = null;
                    try {
                        ex = plywood_1.Expression.fromJS(expression);
                    }
                    catch (e) {
                        res.status(400).send({
                            error: "bad expression",
                            message: e.message
                        });
                        return [2];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4, getSettings()];
                case 2:
                    settings = _b.sent();
                    return [3, 4];
                case 3:
                    e_1 = _b.sent();
                    res.status(400).send({ error: "failed to get settings" });
                    return [2];
                case 4:
                    myDataCube = settings.getDataCube(dataCube);
                    if (!myDataCube) {
                        res.status(400).send({ error: "unknown data cube" });
                        return [2];
                    }
                    if (!myDataCube.executor) {
                        res.status(400).send({ error: "un queryable data cube" });
                        return [2];
                    }
                    if (!(datacube_guard_1.checkAccess(myDataCube, req.headers))) {
                        res.status(403).send({ error: "access denied" });
                        return [2, null];
                    }
                    if (myDataCube.cluster) {
                        req.setTimeout(myDataCube.cluster.getTimeout(), null);
                    }
                    maxQueries = myDataCube.getMaxQueries();
                    _b.label = 5;
                case 5:
                    _b.trys.push([5, 7, , 8]);
                    return [4, myDataCube.executor(ex, { maxQueries: maxQueries, timezone: queryTimezone })];
                case 6:
                    data = _b.sent();
                    reply = {
                        result: plywood_1.Dataset.isDataset(data) ? data.toJS() : data
                    };
                    res.json(reply);
                    return [3, 8];
                case 7:
                    error_1 = _b.sent();
                    console.log("error:", error_1.message);
                    if (error_1.hasOwnProperty("stack")) {
                        console.log(error_1.stack);
                    }
                    res.status(500).send({
                        error: "could not compute",
                        message: error_1.message
                    });
                    return [3, 8];
                case 8: return [2];
            }
        });
    }); });
    return router;
}
exports.plywoodRouter = plywoodRouter;
//# sourceMappingURL=plywood.js.map