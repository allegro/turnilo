import * as React from "react";
import "./color-swabs.scss";
export interface ColorEntry {
    color: string;
    name: string;
    value: string;
    previous?: string;
    delta?: JSX.Element;
}
interface ColorSwabsProps {
    colorEntries: ColorEntry[];
}
export declare const ColorSwabs: React.SFC<ColorSwabsProps>;
export {};
