import { Timezone } from "chronoshift";
import { ContinuousDomain } from "./continuous-types";
export declare type ContinuousTicks = Array<Date | number>;
export default function pickXAxisTicks([start, end]: ContinuousDomain, timezone: Timezone): ContinuousTicks;
