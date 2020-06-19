"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("../../../config/constants");
exports.nestedDataset = function (d) { return (d && d[constants_1.SPLIT] && d[constants_1.SPLIT].data) || []; };
//# sourceMappingURL=nested-dataset.js.map