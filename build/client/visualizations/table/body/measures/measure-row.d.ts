import * as d3 from "d3";
import { Datum } from "plywood";
import * as React from "react";
import { Essence } from "../../../../../common/models/essence/essence";
import "./measure-row.scss";
interface MeasureRowProps {
    essence: Essence;
    highlight: boolean;
    dimmed: boolean;
    style: React.CSSProperties;
    datum: Datum;
    cellWidth: number;
    scales: Array<d3.scale.Linear<number, number>>;
}
export declare const MeasureRow: React.SFC<MeasureRowProps>;
export {};
