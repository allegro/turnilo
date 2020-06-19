import * as React from "react";
import { Unary } from "../../../common/utils/functional/functional";
interface WithRefProps {
    children: Unary<{
        ref?: Element;
        setRef: Unary<Element, void>;
    }, JSX.Element>;
}
interface WithRefState {
    ref?: Element;
}
export declare class WithRef extends React.Component<WithRefProps, WithRefState> {
    state: WithRefState;
    setRef: (ref: Element) => void;
    render(): JSX.Element;
}
export {};
