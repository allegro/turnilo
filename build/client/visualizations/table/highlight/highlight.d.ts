import * as React from "react";
import "./highlight.scss";
interface HighlighterProps {
    highlightedIndex: number;
    highlightedNesting: number;
    scrollTopOffset: number;
    collapseRows: boolean;
}
export declare const Highlighter: React.SFC<HighlighterProps>;
export {};
