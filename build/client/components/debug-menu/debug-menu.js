"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var stage_1 = require("../../../common/models/stage/stage");
var constants_1 = require("../../config/constants");
var bubble_menu_1 = require("../bubble-menu/bubble-menu");
exports.DebugMenu = function (_a) {
    var dataCube = _a.dataCube, openOn = _a.openOn, onClose = _a.onClose, openDruidQueryModal = _a.openDruidQueryModal, openRawDataModal = _a.openRawDataModal, openViewDefinitionModal = _a.openViewDefinitionModal;
    var isNativeCluster = dataCube.clusterName === "native";
    function displayRawData() {
        openRawDataModal();
        onClose();
    }
    function displayViewDefinition() {
        openViewDefinitionModal();
        onClose();
    }
    function displayDruidQuery() {
        openDruidQueryModal();
        onClose();
    }
    return React.createElement(bubble_menu_1.BubbleMenu, { className: "header-menu", direction: "down", stage: stage_1.Stage.fromSize(200, 200), openOn: openOn, onClose: onClose },
        React.createElement("ul", { className: "bubble-list" },
            React.createElement("li", { key: "view-raw-data", onClick: displayRawData }, constants_1.STRINGS.displayRawData),
            !isNativeCluster && React.createElement("li", { key: "view-druid-query", onClick: displayDruidQuery }, constants_1.STRINGS.displayDruidQuery)));
};
//# sourceMappingURL=debug-menu.js.map