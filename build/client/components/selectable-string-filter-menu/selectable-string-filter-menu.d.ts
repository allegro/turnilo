import { Set } from "immutable";
import * as React from "react";
import { Clicker } from "../../../common/models/clicker/clicker";
import { Dimension } from "../../../common/models/dimension/dimension";
import { Essence } from "../../../common/models/essence/essence";
import { FilterClause } from "../../../common/models/filter-clause/filter-clause";
import { Filter, FilterMode } from "../../../common/models/filter/filter";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { DatasetLoad } from "../../../common/models/visualization-props/visualization-props";
import { Fn } from "../../../common/utils/general/general";
import "./selectable-string-filter-menu.scss";
export interface SelectableStringFilterMenuProps {
    clicker: Clicker;
    dimension: Dimension;
    essence: Essence;
    timekeeper: Timekeeper;
    onClose: Fn;
    filterMode?: FilterMode;
    onClauseChange: (clause: FilterClause) => Filter;
}
export interface SelectableStringFilterMenuState {
    searchText: string;
    dataset: DatasetLoad;
    selectedValues: Set<string>;
    pasteModeEnabled: boolean;
}
export declare class SelectableStringFilterMenu extends React.Component<SelectableStringFilterMenuProps, SelectableStringFilterMenuState> {
    private lastSearchText;
    state: SelectableStringFilterMenuState;
    private loadRows;
    private sendQueryFilter;
    private queryFilter;
    private debouncedQueryFilter;
    componentWillMount(): void;
    private initialSelection;
    componentWillUnmount(): void;
    componentDidUpdate(prevProps: SelectableStringFilterMenuProps, prevState: SelectableStringFilterMenuState): void;
    globalKeyDownListener: (e: KeyboardEvent) => void;
    updateSearchText: (searchText: string) => void;
    constructFilter(): Filter;
    onValueClick: (value: string, withModKey: boolean) => void;
    onOkClick: () => void;
    enablePasteMode: () => void;
    disablePasteMode: () => void;
    selectValues: (values: Set<string>) => void;
    isFilterValid(): boolean;
    renderSelectMode(): JSX.Element;
    renderImportMode(): JSX.Element;
    render(): JSX.Element;
}
