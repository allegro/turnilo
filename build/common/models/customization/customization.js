"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chronoshift_1 = require("chronoshift");
var immutable_class_1 = require("immutable-class");
var logger_1 = require("../../logger/logger");
var immutable_utils_1 = require("../../utils/immutable-utils/immutable-utils");
var external_view_1 = require("../external-view/external-view");
var url_shortener_1 = require("../url-shortener/url-shortener");
var availableCssVariables = [
    "background-base",
    "background-brand-light",
    "background-brand-text",
    "background-brand",
    "background-dark",
    "background-light",
    "background-lighter",
    "background-lightest",
    "background-medium",
    "border-darker",
    "border-extra-light",
    "border-light",
    "border-medium",
    "border-super-light",
    "brand-hover",
    "brand-selected",
    "brand",
    "button-primary-active",
    "button-primary-hover",
    "button-secondary-active",
    "button-secondary-hover",
    "button-secondary",
    "button-warn-active",
    "button-warn-hover",
    "button-warn",
    "danger",
    "dark",
    "date-range-picker-selected",
    "drop-area-indicator",
    "error",
    "grid-line-color",
    "highlight-border",
    "highlight",
    "hover",
    "icon-hover",
    "icon-light",
    "item-dimension-hover",
    "item-dimension-text",
    "item-dimension",
    "item-measure-hover",
    "item-measure-text",
    "item-measure",
    "main-time-area",
    "main-time-line",
    "negative",
    "pinboard-icon",
    "positive",
    "text-default-color",
    "text-light",
    "text-lighter",
    "text-lighterish",
    "text-lightest",
    "text-link",
    "text-medium",
    "text-standard"
];
var check;
var Customization = (function () {
    function Customization(parameters) {
        this.title = parameters.title || null;
        this.headerBackground = parameters.headerBackground || null;
        this.customLogoSvg = parameters.customLogoSvg || null;
        if (parameters.externalViews)
            this.externalViews = parameters.externalViews;
        if (parameters.timezones)
            this.timezones = parameters.timezones;
        this.logoutHref = parameters.logoutHref;
        if (parameters.urlShortener)
            this.urlShortener = parameters.urlShortener;
        if (parameters.sentryDSN)
            this.sentryDSN = parameters.sentryDSN;
        if (parameters.cssVariables)
            this.cssVariables = parameters.cssVariables;
    }
    Customization.isCustomization = function (candidate) {
        return candidate instanceof Customization;
    };
    Customization.fromJS = function (parameters) {
        var value = {
            title: parameters.title,
            headerBackground: parameters.headerBackground,
            customLogoSvg: parameters.customLogoSvg,
            logoutHref: parameters.logoutHref,
            sentryDSN: parameters.sentryDSN,
            cssVariables: parameters.cssVariables
        };
        var paramViewsJS = parameters.externalViews;
        var externalViews = null;
        if (Array.isArray(paramViewsJS)) {
            externalViews = paramViewsJS.map(function (view, i) { return external_view_1.ExternalView.fromJS(view); });
            value.externalViews = externalViews;
        }
        var timezonesJS = parameters.timezones;
        var timezones = null;
        if (Array.isArray(timezonesJS)) {
            timezones = timezonesJS.map(chronoshift_1.Timezone.fromJS);
            value.timezones = timezones;
        }
        if (parameters.urlShortener) {
            value.urlShortener = url_shortener_1.UrlShortener.fromJS(parameters.urlShortener);
        }
        return new Customization(value);
    };
    Customization.prototype.valueOf = function () {
        return {
            title: this.title,
            headerBackground: this.headerBackground,
            customLogoSvg: this.customLogoSvg,
            externalViews: this.externalViews,
            timezones: this.timezones,
            urlShortener: this.urlShortener,
            logoutHref: this.logoutHref,
            sentryDSN: this.sentryDSN,
            cssVariables: this.cssVariables
        };
    };
    Customization.prototype.toJS = function () {
        var js = {};
        if (this.title)
            js.title = this.title;
        if (this.sentryDSN)
            js.sentryDSN = this.sentryDSN;
        if (this.headerBackground)
            js.headerBackground = this.headerBackground;
        if (this.customLogoSvg)
            js.customLogoSvg = this.customLogoSvg;
        if (this.externalViews) {
            js.externalViews = this.externalViews.map(function (view) { return view.toJS(); });
        }
        if (this.timezones) {
            js.timezones = this.timezones.map(function (tz) { return tz.toJS(); });
        }
        if (this.urlShortener) {
            js.urlShortener = this.urlShortener.toJS();
        }
        if (this.logoutHref)
            js.logoutHref = this.logoutHref;
        if (this.cssVariables)
            js.cssVariables = this.cssVariables;
        return js;
    };
    Customization.prototype.toJSON = function () {
        return this.toJS();
    };
    Customization.prototype.toString = function () {
        return "[custom: (" + this.headerBackground + ") logo: " + Boolean(this.customLogoSvg) + ", externalViews: " + Boolean(this.externalViews) + ", timezones: " + Boolean(this.timezones) + "]";
    };
    Customization.prototype.equals = function (other) {
        return Customization.isCustomization(other) &&
            this.title === other.title &&
            this.headerBackground === other.headerBackground &&
            this.customLogoSvg === other.customLogoSvg &&
            (!this.urlShortener || this.urlShortener.equals(other.urlShortener)) &&
            immutable_class_1.immutableArraysEqual(this.externalViews, other.externalViews) &&
            immutable_class_1.immutableArraysEqual(this.timezones, other.timezones) &&
            this.sentryDSN === other.sentryDSN &&
            this.logoutHref === other.logoutHref &&
            this.cssVariables === other.cssVariables;
    };
    Customization.prototype.getTitle = function (version) {
        var title = this.title || Customization.DEFAULT_TITLE;
        return title.replace(/%v/g, version);
    };
    Customization.prototype.change = function (propertyName, newValue) {
        return immutable_utils_1.ImmutableUtils.change(this, propertyName, newValue);
    };
    Customization.prototype.changeTitle = function (title) {
        return this.change("title", title);
    };
    Customization.prototype.getTimezones = function () {
        return this.timezones || Customization.DEFAULT_TIMEZONES;
    };
    Customization.prototype.getLogoutHref = function () {
        return this.logoutHref || Customization.DEFAULT_LOGOUT_HREF;
    };
    Customization.prototype.validate = function () {
        var valid = true;
        if (this.cssVariables) {
            Object.keys(this.cssVariables).forEach(function (variableName) {
                if (availableCssVariables.indexOf(variableName) < 0) {
                    valid = false;
                    logger_1.LOGGER.warn("Unsupported css variables \"" + variableName + "\" found.");
                }
            });
        }
        return valid;
    };
    Customization.DEFAULT_TITLE = "Turnilo (%v)";
    Customization.DEFAULT_TIMEZONES = [
        new chronoshift_1.Timezone("America/Juneau"),
        new chronoshift_1.Timezone("America/Los_Angeles"),
        new chronoshift_1.Timezone("America/Yellowknife"),
        new chronoshift_1.Timezone("America/Phoenix"),
        new chronoshift_1.Timezone("America/Denver"),
        new chronoshift_1.Timezone("America/Mexico_City"),
        new chronoshift_1.Timezone("America/Chicago"),
        new chronoshift_1.Timezone("America/New_York"),
        new chronoshift_1.Timezone("America/Argentina/Buenos_Aires"),
        chronoshift_1.Timezone.UTC,
        new chronoshift_1.Timezone("Asia/Jerusalem"),
        new chronoshift_1.Timezone("Europe/Paris"),
        new chronoshift_1.Timezone("Asia/Kolkata"),
        new chronoshift_1.Timezone("Asia/Kathmandu"),
        new chronoshift_1.Timezone("Asia/Hong_Kong"),
        new chronoshift_1.Timezone("Asia/Seoul"),
        new chronoshift_1.Timezone("Pacific/Guam")
    ];
    Customization.DEFAULT_LOGOUT_HREF = "logout";
    return Customization;
}());
exports.Customization = Customization;
check = Customization;
//# sourceMappingURL=customization.js.map