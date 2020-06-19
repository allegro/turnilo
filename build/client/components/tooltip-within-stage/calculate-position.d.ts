import * as React from "react";
import { TooltipWithinStageProps } from "./tooltip-within-stage";
export declare type Rect = ClientRect | DOMRect;
export declare type Position = Pick<React.CSSProperties, "left" | "top">;
export declare function calculatePosition(props: TooltipWithinStageProps, rect?: Rect): Position;
