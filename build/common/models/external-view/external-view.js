"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var check;
var ExternalView = (function () {
    function ExternalView(parameters) {
        var title = parameters.title, linkGenerator = parameters.linkGenerator;
        if (!title)
            throw new Error("External view must have title");
        if (typeof linkGenerator !== "string")
            throw new Error("Must provide link generator function");
        this.title = title;
        this.linkGenerator = linkGenerator;
        var linkGeneratorFnRaw = null;
        try {
            linkGeneratorFnRaw = new Function("dataCube", "dataSource", "timezone", "filter", "splits", linkGenerator);
        }
        catch (e) {
            throw new Error("Error constructing link generator function: " + e.message);
        }
        this.linkGeneratorFn = function (dataCube, timezone, filter, splits) {
            try {
                return linkGeneratorFnRaw(dataCube, dataCube, timezone, filter, splits);
            }
            catch (e) {
                console.warn("Error with custom link generating function '" + title + "': " + e.message + " [" + linkGenerator + "]");
                return null;
            }
        };
        this.sameWindow = Boolean(parameters.sameWindow);
    }
    ExternalView.isExternalView = function (candidate) {
        return candidate instanceof ExternalView;
    };
    ExternalView.fromJS = function (parameters) {
        var value = parameters;
        return new ExternalView({
            title: value.title,
            linkGenerator: value.linkGenerator,
            linkGeneratorFn: value.linkGeneratorFn,
            sameWindow: value.sameWindow
        });
    };
    ExternalView.prototype.toJS = function () {
        var js = {
            title: this.title,
            linkGenerator: this.linkGenerator
        };
        if (this.sameWindow === true)
            js.sameWindow = true;
        return js;
    };
    ExternalView.prototype.valueOf = function () {
        var value = {
            title: this.title,
            linkGenerator: this.linkGenerator
        };
        if (this.sameWindow === true)
            value.sameWindow = true;
        return value;
    };
    ExternalView.prototype.toJSON = function () {
        return this.toJS();
    };
    ExternalView.prototype.equals = function (other) {
        return ExternalView.isExternalView(other) &&
            this.title === other.title &&
            this.linkGenerator === other.linkGenerator &&
            this.sameWindow === other.sameWindow;
    };
    ExternalView.prototype.toString = function () {
        return this.title + ": " + this.linkGenerator;
    };
    return ExternalView;
}());
exports.ExternalView = ExternalView;
check = ExternalView;
//# sourceMappingURL=external-view.js.map