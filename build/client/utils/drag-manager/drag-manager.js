"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DraggedElementType;
(function (DraggedElementType) {
    DraggedElementType[DraggedElementType["NONE"] = 0] = "NONE";
    DraggedElementType[DraggedElementType["DIMENSION"] = 1] = "DIMENSION";
    DraggedElementType[DraggedElementType["MEASURE"] = 2] = "MEASURE";
    DraggedElementType[DraggedElementType["SERIES"] = 3] = "SERIES";
    DraggedElementType[DraggedElementType["SPLIT"] = 4] = "SPLIT";
    DraggedElementType[DraggedElementType["FILTER"] = 5] = "FILTER";
})(DraggedElementType || (DraggedElementType = {}));
var none = { type: DraggedElementType.NONE, element: null };
var DragManager = (function () {
    function DragManager() {
    }
    DragManager.init = function () {
        document.addEventListener("dragend", function () {
            DragManager.dragging = none;
        }, false);
    };
    DragManager.isDraggingSplit = function () {
        return this.dragging.type === DraggedElementType.SPLIT;
    };
    DragManager.isDraggingFilter = function () {
        return this.dragging.type === DraggedElementType.FILTER;
    };
    DragManager.isDraggingSeries = function () {
        return this.dragging.type === DraggedElementType.SERIES;
    };
    DragManager.setDragDimension = function (element) {
        this.dragging = { type: DraggedElementType.DIMENSION, element: element };
    };
    DragManager.setDragMeasure = function (element) {
        this.dragging = { type: DraggedElementType.MEASURE, element: element };
    };
    DragManager.setDragSeries = function (element) {
        this.dragging = { type: DraggedElementType.SERIES, element: element };
    };
    DragManager.setDragFilter = function (element) {
        this.dragging = { type: DraggedElementType.FILTER, element: element };
    };
    DragManager.setDragSplit = function (element) {
        this.dragging = { type: DraggedElementType.SPLIT, element: element };
    };
    DragManager.draggingDimension = function () {
        var el = DragManager.dragging;
        return el.type === DraggedElementType.DIMENSION ? el.element : null;
    };
    DragManager.draggingMeasure = function () {
        var el = DragManager.dragging;
        return el.type === DraggedElementType.MEASURE ? el.element : null;
    };
    DragManager.draggingSplit = function () {
        var el = DragManager.dragging;
        return el.type === DraggedElementType.SPLIT ? el.element : null;
    };
    DragManager.draggingSeries = function () {
        var el = DragManager.dragging;
        return el.type === DraggedElementType.SERIES ? el.element : null;
    };
    DragManager.draggingFilter = function () {
        var el = DragManager.dragging;
        return el.type === DraggedElementType.FILTER ? el.element : null;
    };
    DragManager.dragging = none;
    return DragManager;
}());
exports.DragManager = DragManager;
//# sourceMappingURL=drag-manager.js.map