import * as React from "react";
import "./svg-icon.scss";
export interface SvgIconProps {
    svg: string;
    className?: string;
    style?: any;
}
export interface SvgIconState {
}
export declare class SvgIcon extends React.Component<SvgIconProps, SvgIconState> {
    render(): React.ReactSVGElement;
}
