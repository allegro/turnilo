import * as React from "react";
import "./body-portal.scss";
export interface BodyPortalProps {
    left?: number | string;
    right?: number | string;
    top?: number | string;
    bottom?: number | string;
    fullSize?: boolean;
    disablePointerEvents?: boolean;
    onMount?: () => void;
    isAboveAll?: boolean;
}
interface BodyPortalState {
    isAttached: boolean;
}
export declare class BodyPortal extends React.Component<BodyPortalProps, BodyPortalState> {
    static defaultProps: Partial<BodyPortalProps>;
    private static aboveAll;
    state: {
        isAttached: boolean;
    };
    constructor(props: BodyPortalProps);
    private readonly target;
    componentDidMount(): void;
    componentWillUnmount(): void;
    render(): React.ReactPortal;
}
export {};
