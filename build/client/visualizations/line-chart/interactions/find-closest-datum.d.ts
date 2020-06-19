import { Dataset, Datum } from "plywood";
import { Essence } from "../../../../common/models/essence/essence";
import { ContinuousScale, ContinuousValue } from "../utils/continuous-types";
export declare function findClosestDatum(value: ContinuousValue, essence: Essence, dataset: Dataset, xScale: ContinuousScale): Datum | null;
