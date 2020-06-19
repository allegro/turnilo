import { Dataset } from "plywood";
import * as React from "react";
import { Dimension } from "../../../common/models/dimension/dimension";
import "./preview-list.scss";
import { PreviewFilterMode } from "./preview-string-filter-menu";
interface PreviewListProps {
    dimension: Dimension;
    dataset: Dataset;
    searchText: string;
    regexErrorMessage: string;
    limit: number;
    filterMode: PreviewFilterMode;
}
export declare const row: (content: string, highlight: string) => JSX.Element;
export declare const PreviewList: React.SFC<PreviewListProps>;
export {};
