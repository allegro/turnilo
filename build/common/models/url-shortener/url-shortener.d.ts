import { Instance } from "immutable-class";
import { Binary } from "../../utils/functional/functional";
export declare type UrlShortenerFn = Binary<string, any, Promise<string>>;
export declare type UrlShortenerDef = string;
export declare class UrlShortener implements Instance<UrlShortenerDef, UrlShortenerDef> {
    private shortenerDefinition;
    static fromJS(definition: UrlShortenerDef): UrlShortener;
    readonly shortenerFunction: UrlShortenerFn;
    constructor(shortenerDefinition: string);
    toJS(): UrlShortenerDef;
    valueOf(): UrlShortenerDef;
    toJSON(): UrlShortenerDef;
    equals(other: UrlShortener): boolean;
    toString(): string;
}
