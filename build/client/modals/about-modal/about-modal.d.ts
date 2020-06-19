import * as React from "react";
import { Fn } from "../../../common/utils/general/general";
import "./about-modal.scss";
export interface AboutModalProps {
    version: string;
    onClose: Fn;
}
export interface AboutModalState {
}
export declare class AboutModal extends React.Component<AboutModalProps, AboutModalState> {
    render(): JSX.Element;
}
