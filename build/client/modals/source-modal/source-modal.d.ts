import * as React from "react";
import { Fn } from "../../../common/utils/general/general";
import { JSXNode } from "../../utils/dom/dom";
import "./source-modal.scss";
interface SourceModalProps {
    onClose: Fn;
    title: string;
    header?: JSXNode;
    className?: string;
    copyLabel?: string;
    source: string;
}
interface SourceModalState {
    copied: boolean;
}
export declare class SourceModal extends React.Component<SourceModalProps, SourceModalState> {
    state: SourceModalState;
    onCopy: () => void;
    render(): JSX.Element;
}
export {};
