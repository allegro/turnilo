"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MeasureForViewType;
(function (MeasureForViewType) {
    MeasureForViewType["measure"] = "measure";
    MeasureForViewType["group"] = "group";
})(MeasureForViewType = exports.MeasureForViewType || (exports.MeasureForViewType = {}));
var MeasuresConverter = (function () {
    function MeasuresConverter(hasSearchTextPredicate, isSelectedMeasurePredicate) {
        this.hasSearchTextPredicate = hasSearchTextPredicate;
        this.isSelectedMeasurePredicate = isSelectedMeasurePredicate;
    }
    MeasuresConverter.prototype.visitMeasure = function (measure) {
        var _a = this, hasSearchTextPredicate = _a.hasSearchTextPredicate, isSelectedMeasurePredicate = _a.isSelectedMeasurePredicate;
        return {
            name: measure.name,
            title: measure.getTitleWithUnits(),
            description: measure.description,
            hasSelectedMeasures: isSelectedMeasurePredicate(measure),
            hasSearchText: hasSearchTextPredicate(measure),
            type: MeasureForViewType.measure,
            approximate: measure.isApproximate()
        };
    };
    MeasuresConverter.prototype.visitMeasureGroup = function (measureGroup) {
        var _this = this;
        var name = measureGroup.name, title = measureGroup.title, description = measureGroup.description, measures = measureGroup.measures;
        var measuresForView = measures.map(function (measureOrGroup) { return measureOrGroup.accept(_this); });
        return {
            name: name,
            title: title,
            description: description,
            hasSearchText: measuresForView.some(function (measureForView) { return measureForView.hasSearchText; }),
            hasSelectedMeasures: measuresForView.some(function (measureForView) { return measureForView.hasSelectedMeasures; }),
            children: measuresForView,
            type: MeasureForViewType.group
        };
    };
    return MeasuresConverter;
}());
exports.MeasuresConverter = MeasuresConverter;
//# sourceMappingURL=measures-converter.js.map