import * as React from "react";
import { Fn } from "../../../common/utils/general/general";
import "./highlight-modal.scss";
interface HighlightModalProps {
    title: string;
    left: number;
    top: number;
    dropHighlight: Fn;
    acceptHighlight: Fn;
}
export declare const HighlightModal: React.SFC<HighlightModalProps>;
export {};
