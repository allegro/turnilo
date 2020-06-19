import { Essence, EssenceValue } from "./essence";
export declare class EssenceFixtures {
    static noViz(): EssenceValue;
    static totals(): EssenceValue;
    static lineChart(): EssenceValue;
    static getWikiContext(): {
        dataCube: import("../data-cube/data-cube").DataCube;
    };
    static getTwitterContext(): {
        dataCube: import("../data-cube/data-cube").DataCube;
    };
    static wikiHeatmap(): Essence;
    static wikiTable(): Essence;
    static wikiLineChart(): Essence;
    static wikiTotals(): Essence;
    static wikiLineChartNoNominalSplit(): Essence;
    static wikiLineChartNoSplits(): Essence;
    static twitterNoVisualisation(): Essence;
}
