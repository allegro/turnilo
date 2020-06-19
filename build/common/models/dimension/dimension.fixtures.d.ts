import { Dimension, DimensionJS } from "./dimension";
export declare class DimensionFixtures {
    static readonly COUNTRY_STRING_JS: DimensionJS;
    static readonly COUNTRY_URL_JS: DimensionJS;
    static readonly TIME_JS: DimensionJS;
    static readonly NUMBER_JS: DimensionJS;
    static wikiTimeJS(): DimensionJS;
    static wikiCommentLengthJS(): DimensionJS;
    static wikiTime(): Dimension;
    static wikiIsRobot(): Dimension;
    static wikiChannel(): Dimension;
    static countryString(): Dimension;
    static countryURL(): Dimension;
    static time(): Dimension;
    static number(): Dimension;
    static wikiCommentLength(): Dimension;
}
