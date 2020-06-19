import * as d3 from "d3";
export declare const TICKS_COUNT = 5;
export declare const TICK_WIDTH = 5;
export default function getScale([min, max]: number[], height: number): d3.scale.Linear<number, number>;
