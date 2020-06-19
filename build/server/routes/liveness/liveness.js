"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var router = express_1.Router();
router.get("/", function (req, res) {
    res.sendStatus(200);
});
exports.livenessRouter = router;
//# sourceMappingURL=liveness.js.map