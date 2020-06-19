import { TimeShiftJS } from "../../models/time-shift/time-shift";
import { FilterClauseDefinition } from "../version-4/filter-definition";
import { SplitDefinition } from "../version-4/split-definition";
import { MeasuresDefinitionJS } from "./measures-definition";
export interface ViewDefinition3 {
    visualization: string;
    timezone: string;
    filters: FilterClauseDefinition[];
    splits: SplitDefinition[];
    measures: MeasuresDefinitionJS;
    pinnedDimensions?: string[];
    pinnedSort?: string;
    timeShift?: TimeShiftJS;
}
