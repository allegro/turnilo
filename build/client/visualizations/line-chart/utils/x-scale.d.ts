import { Dataset, PlywoodRange } from "plywood";
import { Essence } from "../../../../common/models/essence/essence";
import { Timekeeper } from "../../../../common/models/timekeeper/timekeeper";
import { ContinuousRange, ContinuousScale } from "./continuous-types";
export declare function createContinuousScale(essence: Essence, domainRange: PlywoodRange, width: number): ContinuousScale;
export declare function calculateXRange(essence: Essence, timekeeper: Timekeeper, dataset: Dataset): ContinuousRange | null;
