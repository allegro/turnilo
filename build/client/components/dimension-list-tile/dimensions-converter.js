"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DimensionForViewType;
(function (DimensionForViewType) {
    DimensionForViewType["dimension"] = "dimension";
    DimensionForViewType["group"] = "group";
})(DimensionForViewType = exports.DimensionForViewType || (exports.DimensionForViewType = {}));
var DimensionsConverter = (function () {
    function DimensionsConverter(hasSearchTextPredicate, isFilteredOrSplitPredicate, isSelectedDimensionPredicate) {
        this.hasSearchTextPredicate = hasSearchTextPredicate;
        this.isFilteredOrSplitPredicate = isFilteredOrSplitPredicate;
        this.isSelectedDimensionPredicate = isSelectedDimensionPredicate;
    }
    DimensionsConverter.prototype.visitDimension = function (dimension) {
        var _a = this, hasSearchTextPredicate = _a.hasSearchTextPredicate, isFilteredOrSplitPredicate = _a.isFilteredOrSplitPredicate, isSelectedDimensionPredicate = _a.isSelectedDimensionPredicate;
        var name = dimension.name, title = dimension.title, description = dimension.description, className = dimension.className;
        return {
            name: name,
            title: title,
            description: description,
            classSuffix: className,
            isFilteredOrSplit: isFilteredOrSplitPredicate(dimension),
            hasSearchText: hasSearchTextPredicate(dimension),
            selected: isSelectedDimensionPredicate(dimension),
            type: DimensionForViewType.dimension
        };
    };
    DimensionsConverter.prototype.visitDimensionGroup = function (dimensionGroup) {
        var _this = this;
        var name = dimensionGroup.name, description = dimensionGroup.description, title = dimensionGroup.title, dimensions = dimensionGroup.dimensions;
        var dimensionsForView = dimensions.map(function (item) { return item.accept(_this); });
        return {
            name: name,
            title: title,
            description: description,
            hasSearchText: dimensionsForView.some(function (item) { return item.hasSearchText; }),
            isFilteredOrSplit: dimensionsForView.some(function (item) { return item.isFilteredOrSplit; }),
            children: dimensionsForView,
            type: DimensionForViewType.group
        };
    };
    return DimensionsConverter;
}());
exports.DimensionsConverter = DimensionsConverter;
//# sourceMappingURL=dimensions-converter.js.map