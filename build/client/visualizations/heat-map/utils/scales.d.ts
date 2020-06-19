import { scale } from "d3";
import { Datum } from "plywood";
import { ConcreteSeries } from "../../../../common/models/series/concrete-series";
export declare type LinearScale = scale.Linear<number, number>;
export declare type ColorScale = scale.Linear<string, string>;
interface Scales {
    x: LinearScale;
    y: LinearScale;
    color: ColorScale;
}
export default function scales(dataset: Datum[], tileSize: number, series: ConcreteSeries): Scales;
export {};
