import { Timezone } from "chronoshift";
import { Instance } from "immutable-class";
import { ExternalView, ExternalViewValue } from "../external-view/external-view";
import { UrlShortener, UrlShortenerDef } from "../url-shortener/url-shortener";
export interface CustomizationValue {
    title?: string;
    headerBackground?: string;
    customLogoSvg?: string;
    externalViews?: ExternalView[];
    timezones?: Timezone[];
    logoutHref?: string;
    urlShortener?: UrlShortener;
    sentryDSN?: string;
    cssVariables?: Record<string, string>;
}
export interface CustomizationJS {
    title?: string;
    headerBackground?: string;
    customLogoSvg?: string;
    externalViews?: ExternalViewValue[];
    timezones?: string[];
    logoutHref?: string;
    urlShortener?: UrlShortenerDef;
    sentryDSN?: string;
    cssVariables?: Record<string, string>;
}
export declare class Customization implements Instance<CustomizationValue, CustomizationJS> {
    static DEFAULT_TITLE: string;
    static DEFAULT_TIMEZONES: Timezone[];
    static DEFAULT_LOGOUT_HREF: string;
    static isCustomization(candidate: any): candidate is Customization;
    static fromJS(parameters: CustomizationJS): Customization;
    headerBackground: string;
    customLogoSvg: string;
    externalViews: ExternalView[];
    timezones: Timezone[];
    title: string;
    logoutHref: string;
    urlShortener: UrlShortener;
    sentryDSN: string;
    cssVariables?: Record<string, string>;
    constructor(parameters: CustomizationValue);
    valueOf(): CustomizationValue;
    toJS(): CustomizationJS;
    toJSON(): CustomizationJS;
    toString(): string;
    equals(other: Customization): boolean;
    getTitle(version: string): string;
    change(propertyName: string, newValue: any): Customization;
    changeTitle(title: string): Customization;
    getTimezones(): Timezone[];
    getLogoutHref(): string;
    validate(): boolean;
}
