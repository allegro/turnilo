import * as React from "react";
import "./golden-center.scss";
export interface GoldenCenterProps {
    topRatio?: number;
    minPadding?: number;
}
export interface GoldenCenterState {
    top?: number;
}
export declare class GoldenCenter extends React.Component<GoldenCenterProps, GoldenCenterState> {
    static defaultProps: Partial<GoldenCenterProps>;
    state: GoldenCenterState;
    componentDidMount(): void;
    componentWillUnmount(): void;
    globalResizeListener: () => void;
    render(): JSX.Element;
}
