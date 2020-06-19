import * as React from "react";
import { Clicker } from "../../../common/models/clicker/clicker";
import { Dimension } from "../../../common/models/dimension/dimension";
import { Essence } from "../../../common/models/essence/essence";
import { FilterClause } from "../../../common/models/filter-clause/filter-clause";
import { Filter, FilterMode } from "../../../common/models/filter/filter";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { DatasetLoad } from "../../../common/models/visualization-props/visualization-props";
import { Fn } from "../../../common/utils/general/general";
import "./preview-string-filter-menu.scss";
export declare type PreviewFilterMode = FilterMode.CONTAINS | FilterMode.REGEX;
export interface PreviewStringFilterMenuProps {
    clicker: Clicker;
    dimension: Dimension;
    essence: Essence;
    timekeeper: Timekeeper;
    onClose: Fn;
    filterMode: FilterMode.REGEX | FilterMode.CONTAINS;
    onClauseChange: (clause: FilterClause) => Filter;
}
export interface PreviewStringFilterMenuState {
    searchText: string;
    dataset: DatasetLoad;
}
export declare class PreviewStringFilterMenu extends React.Component<PreviewStringFilterMenuProps, PreviewStringFilterMenuState> {
    private lastSearchText;
    initialSearchText: () => string;
    state: PreviewStringFilterMenuState;
    updateSearchText: (searchText: string) => void;
    private loadRows;
    private sendQueryFilter;
    private regexErrorMessage;
    private queryFilter;
    private debouncedQueryFilter;
    componentWillMount(): void;
    componentWillUnmount(): void;
    componentDidUpdate(prevProps: PreviewStringFilterMenuProps, prevState: PreviewStringFilterMenuState): void;
    globalKeyDownListener: (e: KeyboardEvent) => void;
    constructFilter(): Filter;
    onOkClick: () => void;
    onCancelClick: () => void;
    actionEnabled(): boolean;
    render(): JSX.Element;
}
