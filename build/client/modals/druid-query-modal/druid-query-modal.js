"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var plywood_1 = require("plywood");
var React = require("react");
var visualization_query_1 = require("../../../common/utils/query/visualization-query");
var source_modal_1 = require("../source-modal/source-modal");
exports.DruidQueryModal = function (_a) {
    var onClose = _a.onClose, timekeeper = _a.timekeeper, essence = _a.essence;
    var _b = essence.dataCube, attributes = _b.attributes, source = _b.source, _c = _b.options, customAggregations = _c.customAggregations, customTransforms = _c.customTransforms;
    var query = visualization_query_1.default(essence, timekeeper);
    var external = plywood_1.External.fromJS({ engine: "druid", attributes: attributes, source: source, customAggregations: customAggregations, customTransforms: customTransforms });
    var plan = query.simulateQueryPlan({ main: external });
    var planSource = JSON.stringify(plan, null, 2);
    return React.createElement(source_modal_1.SourceModal, { onClose: onClose, title: "Druid query", copyLabel: "Copy query", source: planSource });
};
//# sourceMappingURL=druid-query-modal.js.map