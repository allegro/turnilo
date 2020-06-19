"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chronoshift_1 = require("chronoshift");
var immutable_1 = require("immutable");
var immutable_class_1 = require("immutable-class");
var plywood_1 = require("plywood");
var array_1 = require("../../utils/array/array");
var general_1 = require("../../utils/general/general");
var dimension_1 = require("../dimension/dimension");
var dimensions_1 = require("../dimension/dimensions");
var filter_clause_1 = require("../filter-clause/filter-clause");
var filter_1 = require("../filter/filter");
var measure_1 = require("../measure/measure");
var measures_1 = require("../measure/measures");
var refresh_rule_1 = require("../refresh-rule/refresh-rule");
var splits_1 = require("../splits/splits");
function checkDimensionsAndMeasuresNamesUniqueness(dimensions, measures, dataCubeName) {
    if (dimensions != null && measures != null) {
        var dimensionNames = dimensions.getDimensionNames();
        var measureNames = measures.getMeasureNames();
        var duplicateNames = dimensionNames
            .concat(measureNames)
            .groupBy(function (name) { return name; })
            .filter(function (names) { return names.count() > 1; })
            .map(function (names, name) { return name; })
            .toList();
        if (duplicateNames.size > 0) {
            throw new Error("data cube: '" + dataCubeName + "', names: " + general_1.quoteNames(duplicateNames) + " found in both dimensions and measures'");
        }
    }
}
function measuresFromLongForm(longForm) {
    var metricColumn = longForm.metricColumn, measures = longForm.measures, possibleAggregates = longForm.possibleAggregates;
    var myPossibleAggregates = {};
    for (var agg in possibleAggregates) {
        if (!general_1.hasOwnProperty(possibleAggregates, agg))
            continue;
        myPossibleAggregates[agg] = plywood_1.Expression.fromJSLoose(possibleAggregates[agg]);
    }
    return measures.map(function (measure) {
        if (general_1.hasOwnProperty(measure, "name")) {
            return measure_1.Measure.fromJS(measure);
        }
        var title = measure.title;
        if (!title) {
            throw new Error("must have title in longForm value");
        }
        var value = measure.value;
        var aggregate = measure.aggregate;
        if (!aggregate) {
            throw new Error("must have aggregates in longForm value");
        }
        var myExpression = myPossibleAggregates[aggregate];
        if (!myExpression)
            throw new Error("can not find aggregate " + aggregate + " for value " + value);
        var name = general_1.makeUrlSafeName(aggregate + "_" + value);
        return new measure_1.Measure({
            name: name,
            title: title,
            units: measure.units,
            formula: myExpression.substitute(function (ex) {
                if (ex instanceof plywood_1.RefExpression && ex.name === "filtered") {
                    return plywood_1.$("main").filter(plywood_1.$(metricColumn).is(plywood_1.r(value)));
                }
                return null;
            }).toString()
        });
    });
}
function filterFromLongForm(longForm) {
    var metricColumn = longForm.metricColumn, measures = longForm.measures;
    var values = [];
    for (var _i = 0, measures_2 = measures; _i < measures_2.length; _i++) {
        var measure = measures_2[_i];
        if (general_1.hasOwnProperty(measure, "aggregate"))
            values.push(measure.value);
    }
    return plywood_1.$(metricColumn).in(values).simplify();
}
var check;
var DataCube = (function () {
    function DataCube(parameters) {
        var name = parameters.name;
        if (!parameters.name)
            throw new Error("DataCube must have a name");
        general_1.verifyUrlSafeName(name);
        this.name = name;
        this.title = parameters.title ? parameters.title : parameters.name;
        this.clusterName = parameters.clusterName || "druid";
        this.source = parameters.source || name;
        this.group = parameters.group || null;
        this.subsetFormula = parameters.subsetFormula;
        this.subsetExpression = parameters.subsetFormula ? plywood_1.Expression.fromJSLoose(parameters.subsetFormula) : plywood_1.Expression.TRUE;
        this.rollup = Boolean(parameters.rollup);
        this.options = parameters.options || {};
        this.introspection = parameters.introspection;
        this.attributes = parameters.attributes || [];
        this.attributeOverrides = parameters.attributeOverrides || [];
        this.derivedAttributes = parameters.derivedAttributes;
        this.timeAttribute = parameters.timeAttribute;
        this.defaultTimezone = parameters.defaultTimezone;
        this.defaultFilter = parameters.defaultFilter;
        this.defaultSplitDimensions = parameters.defaultSplitDimensions;
        this.defaultDuration = parameters.defaultDuration;
        this.defaultSortMeasure = parameters.defaultSortMeasure;
        this.defaultSelectedMeasures = parameters.defaultSelectedMeasures;
        this.defaultPinnedDimensions = parameters.defaultPinnedDimensions;
        this.maxSplits = parameters.maxSplits;
        this.maxQueries = parameters.maxQueries;
        var _a = this.parseDescription(parameters), description = _a.description, extendedDescription = _a.extendedDescription;
        this.description = description;
        this.extendedDescription = extendedDescription;
        this.refreshRule = parameters.refreshRule || refresh_rule_1.RefreshRule.query();
        this.cluster = parameters.cluster;
        this.executor = parameters.executor;
        var dimensions = parameters.dimensions;
        var measures = parameters.measures;
        checkDimensionsAndMeasuresNamesUniqueness(dimensions, measures, name);
        this.dimensions = dimensions || dimensions_1.Dimensions.empty();
        this.measures = measures || measures_1.Measures.empty();
        this._validateDefaults();
    }
    DataCube.isDataCube = function (candidate) {
        return candidate instanceof DataCube;
    };
    DataCube.queryMaxTime = function (dataCube) {
        if (!dataCube.executor) {
            return Promise.reject(new Error("dataCube not ready"));
        }
        var ex = plywood_1.ply().apply("maxTime", plywood_1.$("main").max(dataCube.timeAttribute));
        return dataCube.executor(ex).then(function (dataset) {
            var maxTimeDate = dataset.data[0]["maxTime"];
            if (isNaN(maxTimeDate))
                return null;
            return maxTimeDate;
        });
    };
    DataCube.fromClusterAndExternal = function (name, cluster, external) {
        var dataCube = DataCube.fromJS({
            name: name,
            clusterName: cluster.name,
            source: String(external.source),
            refreshRule: refresh_rule_1.RefreshRule.query().toJS()
        });
        return dataCube.updateCluster(cluster).updateWithExternal(external);
    };
    DataCube.fromJS = function (parameters, context) {
        if (context === void 0) { context = {}; }
        var cluster = context.cluster, executor = context.executor;
        if (!parameters.name)
            throw new Error("DataCube must have a name");
        var introspection = parameters.introspection;
        if (introspection && DataCube.INTROSPECTION_VALUES.indexOf(introspection) === -1) {
            throw new Error("invalid introspection value " + introspection + ", must be one of " + DataCube.INTROSPECTION_VALUES.join(", "));
        }
        var refreshRule = parameters.refreshRule ? refresh_rule_1.RefreshRule.fromJS(parameters.refreshRule) : null;
        var timeAttributeName = parameters.timeAttribute;
        if (cluster && cluster.type === "druid" && !timeAttributeName) {
            timeAttributeName = "__time";
        }
        var timeAttribute = timeAttributeName ? plywood_1.$(timeAttributeName) : null;
        var attributeOverrides = plywood_1.AttributeInfo.fromJSs(parameters.attributeOverrides || []);
        var attributes = plywood_1.AttributeInfo.fromJSs(parameters.attributes || []);
        var derivedAttributes = null;
        if (parameters.derivedAttributes) {
            derivedAttributes = plywood_1.Expression.expressionLookupFromJS(parameters.derivedAttributes);
        }
        var dimensions;
        var measures;
        try {
            dimensions = dimensions_1.Dimensions.fromJS(parameters.dimensions || []);
            measures = measures_1.Measures.fromJS(parameters.measures || []);
            if (timeAttribute && !dimensions.getDimensionByExpression(timeAttribute)) {
                dimensions = dimensions.prepend(new dimension_1.Dimension({
                    name: timeAttributeName,
                    kind: "time",
                    formula: timeAttribute.toString()
                }));
            }
        }
        catch (e) {
            e.message = "data cube: '" + parameters.name + "', " + e.message;
            throw e;
        }
        var subsetFormula = parameters.subsetFormula || parameters.subsetFilter;
        var defaultFilter = null;
        if (parameters.defaultFilter) {
            try {
                defaultFilter = filter_1.Filter.fromJS(parameters.defaultFilter);
            }
            catch (_a) {
                console.warn("Incorrect format of default filter for " + parameters.name + ". Ignoring field");
            }
        }
        var value = {
            executor: null,
            name: parameters.name,
            title: parameters.title,
            description: parameters.description,
            extendedDescription: parameters.extendedDescription,
            clusterName: parameters.clusterName,
            source: parameters.source,
            group: parameters.group,
            subsetFormula: subsetFormula,
            rollup: parameters.rollup,
            options: parameters.options,
            introspection: introspection,
            attributeOverrides: attributeOverrides,
            attributes: attributes,
            derivedAttributes: derivedAttributes,
            dimensions: dimensions,
            measures: measures,
            timeAttribute: timeAttribute,
            defaultTimezone: parameters.defaultTimezone ? chronoshift_1.Timezone.fromJS(parameters.defaultTimezone) : null,
            defaultFilter: defaultFilter,
            defaultSplitDimensions: parameters.defaultSplitDimensions ? immutable_1.List(parameters.defaultSplitDimensions) : null,
            defaultDuration: parameters.defaultDuration ? chronoshift_1.Duration.fromJS(parameters.defaultDuration) : null,
            defaultSortMeasure: parameters.defaultSortMeasure || (measures.size() ? measures.first().name : null),
            defaultSelectedMeasures: parameters.defaultSelectedMeasures ? immutable_1.OrderedSet(parameters.defaultSelectedMeasures) : null,
            defaultPinnedDimensions: parameters.defaultPinnedDimensions ? immutable_1.OrderedSet(parameters.defaultPinnedDimensions) : null,
            maxSplits: parameters.maxSplits,
            maxQueries: parameters.maxQueries,
            refreshRule: refreshRule
        };
        if (cluster) {
            if (parameters.clusterName !== cluster.name)
                throw new Error("Cluster name '" + parameters.clusterName + "' was given but '" + cluster.name + "' cluster was supplied (must match)");
            value.cluster = cluster;
        }
        if (executor)
            value.executor = executor;
        return new DataCube(value);
    };
    DataCube.prototype.valueOf = function () {
        var value = {
            name: this.name,
            title: this.title,
            description: this.description,
            extendedDescription: this.extendedDescription,
            clusterName: this.clusterName,
            source: this.source,
            group: this.group,
            subsetFormula: this.subsetFormula,
            rollup: this.rollup,
            options: this.options,
            introspection: this.introspection,
            attributeOverrides: this.attributeOverrides,
            attributes: this.attributes,
            derivedAttributes: this.derivedAttributes,
            dimensions: this.dimensions,
            measures: this.measures,
            timeAttribute: this.timeAttribute,
            defaultTimezone: this.defaultTimezone,
            defaultFilter: this.defaultFilter,
            defaultSplitDimensions: this.defaultSplitDimensions,
            defaultDuration: this.defaultDuration,
            defaultSortMeasure: this.defaultSortMeasure,
            defaultSelectedMeasures: this.defaultSelectedMeasures,
            defaultPinnedDimensions: this.defaultPinnedDimensions,
            refreshRule: this.refreshRule,
            maxSplits: this.maxSplits,
            maxQueries: this.maxQueries
        };
        if (this.cluster)
            value.cluster = this.cluster;
        if (this.executor)
            value.executor = this.executor;
        return value;
    };
    DataCube.prototype.toJS = function () {
        var js = {
            name: this.name,
            title: this.title,
            description: this.description,
            clusterName: this.clusterName,
            source: this.source,
            dimensions: this.dimensions.toJS(),
            measures: this.measures.toJS(),
            refreshRule: this.refreshRule.toJS()
        };
        if (this.extendedDescription)
            js.extendedDescription = this.extendedDescription;
        if (this.group)
            js.group = this.group;
        if (this.introspection)
            js.introspection = this.introspection;
        if (this.subsetFormula)
            js.subsetFormula = this.subsetFormula;
        if (this.defaultTimezone)
            js.defaultTimezone = this.defaultTimezone.toJS();
        if (this.defaultFilter)
            js.defaultFilter = this.defaultFilter.toJS();
        if (this.defaultSplitDimensions)
            js.defaultSplitDimensions = this.defaultSplitDimensions.toArray();
        if (this.defaultDuration)
            js.defaultDuration = this.defaultDuration.toJS();
        if (this.defaultSortMeasure)
            js.defaultSortMeasure = this.defaultSortMeasure;
        if (this.defaultSelectedMeasures)
            js.defaultSelectedMeasures = this.defaultSelectedMeasures.toArray();
        if (this.defaultPinnedDimensions)
            js.defaultPinnedDimensions = this.defaultPinnedDimensions.toArray();
        if (this.rollup)
            js.rollup = true;
        if (this.maxSplits)
            js.maxSplits = this.maxSplits;
        if (this.maxQueries)
            js.maxQueries = this.maxQueries;
        if (this.timeAttribute)
            js.timeAttribute = this.timeAttribute.name;
        if (this.attributeOverrides.length)
            js.attributeOverrides = plywood_1.AttributeInfo.toJSs(this.attributeOverrides);
        if (this.attributes.length)
            js.attributes = plywood_1.AttributeInfo.toJSs(this.attributes);
        if (this.derivedAttributes)
            js.derivedAttributes = plywood_1.Expression.expressionLookupToJS(this.derivedAttributes);
        if (Object.keys(this.options).length)
            js.options = this.options;
        return js;
    };
    DataCube.prototype.toJSON = function () {
        return this.toJS();
    };
    DataCube.prototype.toString = function () {
        return "[DataCube: " + this.name + "]";
    };
    DataCube.prototype.equalsSource = function (source) {
        if (!Array.isArray(source))
            return this.source === source;
        if (!Array.isArray(this.source))
            return false;
        return array_1.shallowEqualArrays(this.source, source);
    };
    DataCube.prototype.equals = function (other) {
        return DataCube.isDataCube(other) &&
            this.name === other.name &&
            this.title === other.title &&
            this.description === other.description &&
            this.extendedDescription === other.extendedDescription &&
            this.clusterName === other.clusterName &&
            this.equalsSource(other.source) &&
            this.group === other.group &&
            this.subsetFormula === other.subsetFormula &&
            this.rollup === other.rollup &&
            JSON.stringify(this.options) === JSON.stringify(other.options) &&
            this.introspection === other.introspection &&
            immutable_class_1.immutableArraysEqual(this.attributeOverrides, other.attributeOverrides) &&
            immutable_class_1.immutableArraysEqual(this.attributes, other.attributes) &&
            immutable_class_1.immutableLookupsEqual(this.derivedAttributes, other.derivedAttributes) &&
            this.dimensions.equals(other.dimensions) &&
            this.measures.equals(other.measures) &&
            immutable_class_1.immutableEqual(this.timeAttribute, other.timeAttribute) &&
            immutable_class_1.immutableEqual(this.defaultTimezone, other.defaultTimezone) &&
            immutable_class_1.immutableEqual(this.defaultFilter, other.defaultFilter) &&
            immutable_class_1.immutableEqual(this.defaultSplitDimensions, other.defaultSplitDimensions) &&
            immutable_class_1.immutableEqual(this.defaultDuration, other.defaultDuration) &&
            this.defaultSortMeasure === other.defaultSortMeasure &&
            Boolean(this.defaultSelectedMeasures) === Boolean(other.defaultSelectedMeasures) &&
            (!this.defaultSelectedMeasures || this.defaultSelectedMeasures.equals(other.defaultSelectedMeasures)) &&
            Boolean(this.defaultPinnedDimensions) === Boolean(other.defaultPinnedDimensions) &&
            (!this.defaultPinnedDimensions || this.defaultPinnedDimensions.equals(other.defaultPinnedDimensions)) &&
            this.maxSplits === other.maxSplits &&
            this.maxQueries === other.maxQueries &&
            this.refreshRule.equals(other.refreshRule);
    };
    DataCube.prototype.parseDescription = function (_a) {
        var description = _a.description, extendedDescription = _a.extendedDescription;
        if (!description) {
            return { description: "" };
        }
        if (extendedDescription) {
            return { description: description, extendedDescription: extendedDescription };
        }
        var segments = description.split(/\n---\n/);
        if (segments.length === 0) {
            return { description: description };
        }
        return {
            description: segments[0],
            extendedDescription: segments.splice(1).join("\n---\n ")
        };
    };
    DataCube.prototype._validateDefaults = function () {
        var _a = this, measures = _a.measures, defaultSortMeasure = _a.defaultSortMeasure;
        if (defaultSortMeasure) {
            if (!measures.containsMeasureWithName(defaultSortMeasure)) {
                throw new Error("can not find defaultSortMeasure '" + defaultSortMeasure + "' in data cube '" + this.name + "'");
            }
        }
    };
    DataCube.prototype.toExternal = function () {
        if (this.clusterName === "native")
            throw new Error("there is no external on a native data cube");
        var _a = this, cluster = _a.cluster, options = _a.options;
        if (!cluster)
            throw new Error("must have a cluster");
        var externalValue = {
            engine: cluster.type,
            suppress: true,
            source: this.source,
            version: cluster.version,
            derivedAttributes: this.derivedAttributes,
            customAggregations: options.customAggregations,
            customTransforms: options.customTransforms,
            filter: this.subsetExpression
        };
        if (cluster.type === "druid") {
            externalValue.rollup = this.rollup;
            externalValue.timeAttribute = this.timeAttribute.name;
            externalValue.introspectionStrategy = cluster.getIntrospectionStrategy();
            externalValue.allowSelectQueries = true;
            var externalContext = options.druidContext || {};
            externalContext["timeout"] = cluster.getTimeout();
            externalValue.context = externalContext;
        }
        if (this.introspection === "none") {
            externalValue.attributes = plywood_1.AttributeInfo.override(this.deduceAttributes(), this.attributeOverrides);
            externalValue.derivedAttributes = this.derivedAttributes;
        }
        else {
            externalValue.attributeOverrides = this.attributeOverrides;
        }
        return plywood_1.External.fromValue(externalValue);
    };
    DataCube.prototype.getMainTypeContext = function () {
        var _a = this, attributes = _a.attributes, derivedAttributes = _a.derivedAttributes;
        if (!attributes)
            return null;
        var datasetType = {};
        for (var _i = 0, attributes_1 = attributes; _i < attributes_1.length; _i++) {
            var attribute = attributes_1[_i];
            datasetType[attribute.name] = attribute;
        }
        for (var name_1 in derivedAttributes) {
            datasetType[name_1] = {
                type: derivedAttributes[name_1].type
            };
        }
        return {
            type: "DATASET",
            datasetType: datasetType
        };
    };
    DataCube.prototype.getIssues = function () {
        var _a = this, dimensions = _a.dimensions, measures = _a.measures;
        var mainTypeContext = this.getMainTypeContext();
        var issues = [];
        dimensions.forEachDimension(function (dimension) {
            try {
                dimension.expression.changeInTypeContext(mainTypeContext);
            }
            catch (e) {
                issues.push("failed to validate dimension '" + dimension.name + "': " + e.message);
            }
        });
        var measureTypeContext = {
            type: "DATASET",
            datasetType: {
                main: mainTypeContext
            }
        };
        measures.forEachMeasure(function (measure) {
            try {
                measure.expression.changeInTypeContext(measureTypeContext);
            }
            catch (e) {
                var message = e.message;
                if (measure.expression.getFreeReferences().indexOf("main") === -1) {
                    message = "measure must contain a $main reference";
                }
                issues.push("failed to validate measure '" + measure.name + "': " + message);
            }
        });
        return issues;
    };
    DataCube.prototype.updateCluster = function (cluster) {
        var value = this.valueOf();
        value.cluster = cluster;
        return new DataCube(value);
    };
    DataCube.prototype.updateWithDataset = function (dataset) {
        if (this.clusterName !== "native")
            throw new Error("must be native to have a dataset");
        var executor = plywood_1.basicExecutorFactory({
            datasets: { main: dataset }
        });
        return this.addAttributes(dataset.attributes).attachExecutor(executor);
    };
    DataCube.prototype.updateWithExternal = function (external) {
        if (this.clusterName === "native")
            throw new Error("can not be native and have an external");
        var executor = plywood_1.basicExecutorFactory({
            datasets: { main: external }
        });
        return this.addAttributes(external.attributes).attachExecutor(executor);
    };
    DataCube.prototype.attachExecutor = function (executor) {
        var value = this.valueOf();
        value.executor = executor;
        return new DataCube(value);
    };
    DataCube.prototype.toClientDataCube = function () {
        var value = this.valueOf();
        value.subsetFormula = null;
        value.introspection = null;
        value.attributeOverrides = null;
        if (value.options.druidContext) {
            delete value.options.druidContext;
        }
        return new DataCube(value);
    };
    DataCube.prototype.isQueryable = function () {
        return Boolean(this.executor);
    };
    DataCube.prototype.getMaxTime = function (timekeeper) {
        var _a = this, name = _a.name, refreshRule = _a.refreshRule;
        if (refreshRule.isRealtime()) {
            return timekeeper.now();
        }
        else if (refreshRule.isFixed()) {
            return refreshRule.time;
        }
        else {
            return timekeeper.getTime(name);
        }
    };
    DataCube.prototype.getDimension = function (dimensionName) {
        return this.dimensions.getDimensionByName(dimensionName);
    };
    DataCube.prototype.getDimensionByExpression = function (expression) {
        return this.dimensions.getDimensionByExpression(expression);
    };
    DataCube.prototype.getDimensionsByKind = function (kind) {
        return this.dimensions.filterDimensions(function (dimension) { return dimension.kind === kind; });
    };
    DataCube.prototype.getSuggestedDimensions = function () {
        return [];
    };
    DataCube.prototype.getTimeDimension = function () {
        return this.getDimensionByExpression(this.timeAttribute);
    };
    DataCube.prototype.isTimeAttribute = function (ex) {
        return ex.equals(this.timeAttribute);
    };
    DataCube.prototype.getMeasure = function (measureName) {
        return this.measures.getMeasureByName(measureName);
    };
    DataCube.prototype.getSuggestedMeasures = function () {
        return [];
    };
    DataCube.prototype.changeDimensions = function (dimensions) {
        var value = this.valueOf();
        value.dimensions = dimensions;
        return new DataCube(value);
    };
    DataCube.prototype.rolledUp = function () {
        return this.clusterName === "druid";
    };
    DataCube.prototype.deduceAttributes = function () {
        var _a = this, dimensions = _a.dimensions, measures = _a.measures, timeAttribute = _a.timeAttribute, attributeOverrides = _a.attributeOverrides;
        var attributes = [];
        if (timeAttribute) {
            attributes.push(plywood_1.AttributeInfo.fromJS({ name: timeAttribute.name, type: "TIME" }));
        }
        dimensions.forEachDimension(function (dimension) {
            var expression = dimension.expression;
            if (expression.equals(timeAttribute))
                return;
            var references = expression.getFreeReferences();
            for (var _i = 0, references_1 = references; _i < references_1.length; _i++) {
                var reference = references_1[_i];
                if (immutable_class_1.NamedArray.findByName(attributes, reference))
                    continue;
                attributes.push(plywood_1.AttributeInfo.fromJS({ name: reference, type: "STRING" }));
            }
        });
        measures.forEachMeasure(function (measure) {
            var references = measure_1.Measure.getReferences(measure.expression);
            for (var _i = 0, references_2 = references; _i < references_2.length; _i++) {
                var reference = references_2[_i];
                if (immutable_class_1.NamedArray.findByName(attributes, reference))
                    continue;
                if (measure_1.Measure.hasCountDistinctReferences(measure.expression))
                    continue;
                if (measure_1.Measure.hasQuantileReferences(measure.expression))
                    continue;
                attributes.push(plywood_1.AttributeInfo.fromJS({ name: reference, type: "NUMBER" }));
            }
        });
        if (attributeOverrides.length) {
            attributes = plywood_1.AttributeInfo.override(attributes, attributeOverrides);
        }
        return attributes;
    };
    DataCube.prototype.addAttributes = function (newAttributes) {
        var _this = this;
        var _a = this, dimensions = _a.dimensions, measures = _a.measures, attributes = _a.attributes;
        var introspection = this.getIntrospection();
        if (introspection === "none")
            return this;
        var autofillDimensions = introspection === "autofill-dimensions-only" || introspection === "autofill-all";
        var autofillMeasures = introspection === "autofill-measures-only" || introspection === "autofill-all";
        var $main = plywood_1.$("main");
        var _loop_1 = function (newAttribute) {
            var name_2 = newAttribute.name, type = newAttribute.type, nativeType = newAttribute.nativeType, maker = newAttribute.maker;
            if (attributes && immutable_class_1.NamedArray.findByName(attributes, name_2))
                return "continue";
            var urlSafeName = general_1.makeUrlSafeName(name_2);
            if (this_1.getDimension(urlSafeName) || this_1.getMeasure(urlSafeName))
                return "continue";
            var expression = void 0;
            switch (type) {
                case "TIME":
                    if (!autofillDimensions)
                        return "continue";
                    expression = plywood_1.$(name_2);
                    if (this_1.getDimensionByExpression(expression))
                        return "continue";
                    dimensions = dimensions.prepend(new dimension_1.Dimension({
                        name: urlSafeName,
                        kind: "time",
                        formula: expression.toString()
                    }));
                    break;
                case "STRING":
                    if (!autofillDimensions)
                        return "continue";
                    expression = plywood_1.$(name_2);
                    if (this_1.getDimensionByExpression(expression))
                        return "continue";
                    dimensions = dimensions.append(new dimension_1.Dimension({
                        name: urlSafeName,
                        formula: expression.toString()
                    }));
                    break;
                case "SET/STRING":
                    if (!autofillDimensions)
                        return "continue";
                    expression = plywood_1.$(name_2);
                    if (this_1.getDimensionByExpression(expression))
                        return "continue";
                    dimensions = dimensions.append(new dimension_1.Dimension({
                        kind: "string",
                        multiValue: true,
                        name: urlSafeName,
                        formula: expression.toString()
                    }));
                    break;
                case "BOOLEAN":
                    if (!autofillDimensions)
                        return "continue";
                    expression = plywood_1.$(name_2);
                    if (this_1.getDimensionByExpression(expression))
                        return "continue";
                    dimensions = dimensions.append(new dimension_1.Dimension({
                        name: urlSafeName,
                        kind: "boolean",
                        formula: expression.toString()
                    }));
                    break;
                case "NUMBER":
                case "NULL":
                    if (!autofillMeasures)
                        return "continue";
                    if (!maker) {
                        expression = plywood_1.$(name_2);
                        if (this_1.getDimensionByExpression(expression))
                            return "continue";
                        dimensions = dimensions.append(new dimension_1.Dimension({
                            name: urlSafeName,
                            kind: "number",
                            formula: expression.toString()
                        }));
                    }
                    else {
                        var newMeasures = measure_1.Measure.measuresFromAttributeInfo(newAttribute);
                        newMeasures.forEach(function (newMeasure) {
                            if (_this.measures.getMeasureByExpression(newMeasure.expression))
                                return;
                            measures = (name_2 === "count") ? measures.prepend(newMeasure) : measures.append(newMeasure);
                        });
                    }
                    break;
                default:
                    throw new Error("unsupported attribute " + name_2 + "; type " + type + ", native type " + nativeType);
            }
        };
        var this_1 = this;
        for (var _i = 0, newAttributes_1 = newAttributes; _i < newAttributes_1.length; _i++) {
            var newAttribute = newAttributes_1[_i];
            _loop_1(newAttribute);
        }
        if (!this.rolledUp() && !measures.containsMeasureWithName("count")) {
            measures = measures.prepend(new measure_1.Measure({
                name: "count",
                formula: $main.count().toString()
            }));
        }
        var value = this.valueOf();
        value.attributes = attributes ? plywood_1.AttributeInfo.override(attributes, newAttributes) : newAttributes;
        value.dimensions = dimensions;
        value.measures = measures;
        if (!value.defaultSortMeasure) {
            value.defaultSortMeasure = measures.size() ? measures.first().name : null;
        }
        if (!value.timeAttribute && dimensions.size && dimensions.first().kind === "time") {
            value.timeAttribute = dimensions.first().expression;
        }
        return new DataCube(value);
    };
    DataCube.prototype.getIntrospection = function () {
        return this.introspection || DataCube.DEFAULT_INTROSPECTION;
    };
    DataCube.prototype.getDefaultTimezone = function () {
        return this.defaultTimezone || DataCube.DEFAULT_DEFAULT_TIMEZONE;
    };
    DataCube.prototype.getDefaultFilter = function () {
        var filter = this.defaultFilter || DataCube.DEFAULT_DEFAULT_FILTER;
        if (!this.timeAttribute)
            return filter;
        return filter.insertByIndex(0, new filter_clause_1.RelativeTimeFilterClause({
            period: filter_clause_1.TimeFilterPeriod.LATEST,
            duration: this.getDefaultDuration(),
            reference: this.getTimeDimension().name
        }));
    };
    DataCube.prototype.getDefaultSplits = function () {
        var _this = this;
        if (this.defaultSplitDimensions) {
            var dimensions = this.defaultSplitDimensions.map(function (name) { return _this.getDimension(name); });
            return splits_1.Splits.fromDimensions(dimensions);
        }
        return DataCube.DEFAULT_DEFAULT_SPLITS;
    };
    DataCube.prototype.getDefaultDuration = function () {
        return this.defaultDuration || DataCube.DEFAULT_DEFAULT_DURATION;
    };
    DataCube.prototype.getDefaultSortMeasure = function () {
        return this.defaultSortMeasure;
    };
    DataCube.prototype.getMaxSplits = function () {
        return general_1.isTruthy(this.maxSplits) ? this.maxSplits : DataCube.DEFAULT_MAX_SPLITS;
    };
    DataCube.prototype.getMaxQueries = function () {
        return general_1.isTruthy(this.maxQueries) ? this.maxQueries : DataCube.DEFAULT_MAX_QUERIES;
    };
    DataCube.prototype.getDefaultSelectedMeasures = function () {
        return this.defaultSelectedMeasures || this.measures.getFirstNMeasureNames(4);
    };
    DataCube.prototype.getDefaultPinnedDimensions = function () {
        return this.defaultPinnedDimensions || immutable_1.OrderedSet([]);
    };
    DataCube.prototype.change = function (propertyName, newValue) {
        var v = this.valueOf();
        if (!v.hasOwnProperty(propertyName)) {
            throw new Error("Unknown property : " + propertyName);
        }
        v[propertyName] = newValue;
        return new DataCube(v);
    };
    DataCube.prototype.changeDefaultSortMeasure = function (defaultSortMeasure) {
        return this.change("defaultSortMeasure", defaultSortMeasure);
    };
    DataCube.prototype.changeTitle = function (title) {
        return this.change("title", title);
    };
    DataCube.prototype.changeDescription = function (description) {
        return this.change("description", description);
    };
    DataCube.prototype.changeMeasures = function (measures) {
        return this.change("measures", measures);
    };
    DataCube.DEFAULT_INTROSPECTION = "autofill-all";
    DataCube.INTROSPECTION_VALUES = ["none", "no-autofill", "autofill-dimensions-only", "autofill-measures-only", "autofill-all"];
    DataCube.DEFAULT_DEFAULT_TIMEZONE = new chronoshift_1.Timezone("Asia/Kolkata");
    DataCube.DEFAULT_DEFAULT_FILTER = filter_1.EMPTY_FILTER;
    DataCube.DEFAULT_DEFAULT_SPLITS = splits_1.EMPTY_SPLITS;
    DataCube.DEFAULT_DEFAULT_DURATION = chronoshift_1.Duration.fromJS("P1D");
    DataCube.DEFAULT_MAX_SPLITS = 3;
    DataCube.DEFAULT_MAX_QUERIES = 500;
    return DataCube;
}());
exports.DataCube = DataCube;
check = DataCube;
//# sourceMappingURL=data-cube.js.map