import * as React from "react";
import { DragEvent, MouseEvent } from "react";
import "./dimension-item.scss";
export declare const DIMENSION_CLASS_NAME = "dimension";
export interface DimensionItemProps {
    name: string;
    title: string;
    description?: string;
    classSuffix: string;
    dimensionClick: DimensionClickHandler;
    dimensionDragStart: DimensionDragStartHandler;
    searchText: string;
    selected: boolean;
}
export declare type DimensionClickHandler = (dimensionName: string, e: MouseEvent<HTMLElement>) => void;
export declare type DimensionDragStartHandler = (dimensionName: string, e: DragEvent<HTMLElement>) => void;
export declare const DimensionItem: React.SFC<DimensionItemProps>;
