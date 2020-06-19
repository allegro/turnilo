import { Dimension } from "../dimension/dimension";
import { VisStrategy } from "../essence/essence";
import { Filter } from "../filter/filter";
import { SeriesList } from "../series-list/series-list";
import { Series } from "../series/series";
import { Split } from "../split/split";
import { Splits } from "../splits/splits";
import { TimeShift } from "../time-shift/time-shift";
import { VisualizationManifest } from "../visualization-manifest/visualization-manifest";
import { VisualizationSettings } from "../visualization-settings/visualization-settings";
export interface Clicker {
    changeFilter?(filter: Filter): void;
    changeComparisonShift?(timeShift: TimeShift): void;
    changeSplits?(splits: Splits, strategy: VisStrategy): void;
    changeSplit?(split: Split, strategy: VisStrategy): void;
    addSplit?(split: Split, strategy: VisStrategy): void;
    removeSplit?(split: Split, strategy: VisStrategy): void;
    changeSeriesList?(seriesList: SeriesList): void;
    addSeries?(series: Series): void;
    removeSeries?(series: Series): void;
    changeVisualization?(visualization: VisualizationManifest, settings: VisualizationSettings): void;
    pin?(dimension: Dimension): void;
    unpin?(dimension: Dimension): void;
    changePinnedSortSeries?(series: Series): void;
}
