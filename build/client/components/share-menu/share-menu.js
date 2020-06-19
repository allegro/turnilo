"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var stage_1 = require("../../../common/models/stage/stage");
var constants_1 = require("../../config/constants");
var download_1 = require("../../utils/download/download");
var bubble_menu_1 = require("../bubble-menu/bubble-menu");
var safe_copy_to_clipboard_1 = require("../safe-copy-to-clipboard/safe-copy-to-clipboard");
function onExport(fileFormat, props) {
    var onClose = props.onClose, getDownloadableDataset = props.getDownloadableDataset, essence = props.essence, timekeeper = props.timekeeper;
    var dataSetWithTabOptions = getDownloadableDataset();
    if (!dataSetWithTabOptions.dataset)
        return;
    var dataCube = essence.dataCube;
    var effectiveFilter = essence.getEffectiveFilter(timekeeper);
    var fileName = download_1.makeFileName(dataCube.name, download_1.dateFromFilter(effectiveFilter));
    download_1.download(dataSetWithTabOptions, fileFormat, fileName);
    onClose();
}
function exportItems(props) {
    return constants_1.exportOptions.map(function (_a) {
        var label = _a.label, fileFormat = _a.fileFormat;
        return React.createElement("li", { key: "export-" + fileFormat, onClick: function () { return onExport(fileFormat, props); } }, label);
    });
}
function linkItems(_a) {
    var essence = _a.essence, customization = _a.customization, timekeeper = _a.timekeeper, onClose = _a.onClose, urlForEssence = _a.urlForEssence, openUrlShortenerModal = _a.openUrlShortenerModal;
    var isRelative = essence.filter.isRelative();
    var hash = urlForEssence(essence);
    var specificHash = urlForEssence(essence.convertToSpecificFilter(timekeeper));
    function openShortenerModal(url, title) {
        openUrlShortenerModal(url, title);
        onClose();
    }
    return React.createElement(React.Fragment, null,
        React.createElement(safe_copy_to_clipboard_1.SafeCopyToClipboard, { key: "copy-url", text: hash },
            React.createElement("li", { onClick: onClose }, isRelative ? constants_1.STRINGS.copyRelativeTimeUrl : constants_1.STRINGS.copyUrl)),
        isRelative && React.createElement(safe_copy_to_clipboard_1.SafeCopyToClipboard, { key: "copy-specific-url", text: specificHash },
            React.createElement("li", { onClick: onClose }, constants_1.STRINGS.copyFixedTimeUrl)),
        customization.urlShortener && React.createElement(React.Fragment, null,
            React.createElement("li", { key: "short-url", onClick: function () { return openShortenerModal(hash, isRelative ? constants_1.STRINGS.copyRelativeTimeUrl : constants_1.STRINGS.copyUrl); } }, isRelative ? constants_1.STRINGS.createShortRelativeUrl : constants_1.STRINGS.createShortUrl),
            isRelative && React.createElement("li", { key: "short-url-specific", onClick: function () { return openShortenerModal(specificHash, constants_1.STRINGS.copyFixedTimeUrl); } }, constants_1.STRINGS.createShortFixedUrl)));
}
function externalViewItems(_a) {
    var _b = _a.customization.externalViews, externalViews = _b === void 0 ? [] : _b, essence = _a.essence;
    return externalViews.map(function (externalView, i) {
        var url = externalView.linkGeneratorFn(essence.dataCube, essence.timezone, essence.filter, essence.splits);
        return React.createElement("li", { key: "custom-url-" + i },
            React.createElement("a", { href: url, target: externalView.sameWindow ? "_self" : "_blank" }, constants_1.STRINGS.openIn + " " + externalView.title));
    });
}
exports.ShareMenu = function (props) {
    var openOn = props.openOn, onClose = props.onClose;
    return React.createElement(bubble_menu_1.BubbleMenu, { className: "header-menu", direction: "down", stage: stage_1.Stage.fromSize(230, 200), openOn: openOn, onClose: onClose },
        React.createElement("ul", { className: "bubble-list" },
            exportItems(props),
            externalViewItems(props)));
};
//# sourceMappingURL=share-menu.js.map