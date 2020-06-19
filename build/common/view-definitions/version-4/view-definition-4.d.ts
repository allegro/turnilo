import { TimeShiftJS } from "../../models/time-shift/time-shift";
import { FilterClauseDefinition } from "./filter-definition";
import { SeriesDefinition } from "./series-definition";
import { SplitDefinition } from "./split-definition";
export interface ViewDefinition4 {
    visualization: string;
    visualizationSettings?: object;
    timezone: string;
    filters: FilterClauseDefinition[];
    splits: SplitDefinition[];
    series: SeriesDefinition[];
    pinnedDimensions?: string[];
    pinnedSort?: string;
    timeShift?: TimeShiftJS;
}
