import { Duration } from "chronoshift";
import { Expression } from "plywood";
declare type FilterExpression = Expression;
export declare enum TimeShiftEnvType {
    CURRENT = 0,
    WITH_PREVIOUS = 1
}
interface TimeShiftEnvBase {
    type: TimeShiftEnvType;
}
export interface TimeShiftEnvCurrent extends TimeShiftEnvBase {
    type: TimeShiftEnvType.CURRENT;
}
export interface TimeShiftEnvWithPrevious extends TimeShiftEnvBase {
    type: TimeShiftEnvType.WITH_PREVIOUS;
    shift: Duration;
    currentFilter: FilterExpression;
    previousFilter: FilterExpression;
}
export declare type TimeShiftEnv = TimeShiftEnvCurrent | TimeShiftEnvWithPrevious;
export {};
