import * as React from "react";
import "./measure-item.scss";
import { MeasureClickHandler, MeasureDragStartHandler } from "./measures-tile";
export declare const MEASURE_CLASS_NAME = "measure-item";
export interface MeasureItemProps {
    name: string;
    title: string;
    approximate: boolean;
    description?: string;
    selected: boolean;
    measureClick: MeasureClickHandler;
    measureDragStart: MeasureDragStartHandler;
    searchText: string;
}
export declare const MeasureItem: React.SFC<MeasureItemProps>;
