import { Instance } from "immutable-class";
import * as React from "react";
export interface MarginParameters {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
}
export interface StageValue {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface StageJS {
    x: number;
    y: number;
    width: number;
    height: number;
}
export declare class Stage implements Instance<StageValue, StageJS> {
    static isStage(candidate: any): candidate is Stage;
    static fromJS(parameters: StageJS): Stage;
    static fromClientRect(rect: ClientRect): Stage;
    static fromSize(width: number, height: number): Stage;
    x: number;
    y: number;
    width: number;
    height: number;
    constructor(parameters: StageValue);
    valueOf(): StageValue;
    toJS(): StageJS;
    toJSON(): StageJS;
    private sizeOnlyValue;
    toString(): string;
    equals(other: Stage): boolean;
    getTransform(): string;
    getViewBox(widthOffset?: number, heightOffset?: number): string;
    getLeftTop(): React.CSSProperties;
    getWidthHeight(widthOffset?: number, heightOffset?: number): React.CSSProperties;
    getLeftTopWidthHeight(): React.CSSProperties;
    changeY(y: number): Stage;
    changeHeight(height: number): Stage;
    within(param: MarginParameters): Stage;
}
