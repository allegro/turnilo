import * as React from "react";
import "./highlight-string.scss";
export interface HighlightStringProps {
    className?: string;
    text: string;
    highlight: string | RegExp;
}
export declare const HighlightString: React.SFC<HighlightStringProps>;
