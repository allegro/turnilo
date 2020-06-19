import { Dimension } from "../dimension/dimension";
import { Measure } from "../measure/measure";
import { DimensionSortOn, SeriesSortOn } from "./sort-on";
export declare class SortOnFixtures {
    static readonly DEFAULT_A_JS: Measure;
    static readonly DEFAULT_B_JS: Measure;
    static readonly DEFAULT_C_JS: Dimension;
    static defaultA(): SeriesSortOn;
    static defaultB(): SeriesSortOn;
    static defaultC(): DimensionSortOn;
}
