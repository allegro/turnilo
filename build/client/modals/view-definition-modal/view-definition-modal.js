"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var general_1 = require("../../../common/utils/general/general");
var view_definitions_1 = require("../../../common/view-definitions");
var constants_1 = require("../../config/constants");
var source_modal_1 = require("../source-modal/source-modal");
require("./view-definition-modal.scss");
var header = React.createElement(React.Fragment, null,
    "View definition for ",
    React.createElement("a", { className: "mkurl-link", target: "_blank", href: "https://github.com/allegro/turnilo/blob/master/docs/generating-links.md" }, "mkurl"));
exports.ViewDefinitionModal = function (_a) {
    var essence = _a.essence, onClose = _a.onClose;
    var viewDefinition = {
        dataCubeName: essence.dataCube.name,
        viewDefinitionVersion: view_definitions_1.DEFAULT_VIEW_DEFINITION_VERSION,
        viewDefinition: view_definitions_1.defaultDefinitionConverter.toViewDefinition(essence)
    };
    var viewDefinitionAsJson = JSON.stringify(viewDefinition, null, 2);
    return React.createElement(source_modal_1.SourceModal, { onClose: onClose, header: header, title: "" + general_1.makeTitle(constants_1.STRINGS.viewDefinition), source: viewDefinitionAsJson });
};
//# sourceMappingURL=view-definition-modal.js.map