export interface BarCoordinatesValue {
    x: number;
    y: number;
    height: number;
    width: number;
    barOffset: number;
    barWidth: number;
    stepWidth: number;
    children: BarCoordinates[];
}
export declare class BarCoordinates {
    x: number;
    y: number;
    height: number;
    width: number;
    barOffset: number;
    barWidth: number;
    stepWidth: number;
    children: BarCoordinates[];
    private hitboxMin;
    private hitboxMax;
    constructor(parameters: BarCoordinatesValue);
    isXWithin(x: number): boolean;
    hasChildren(): boolean;
    readonly middleX: number;
}
