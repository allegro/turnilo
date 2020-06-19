import * as React from "react";
import { FilterMode } from "../../../common/models/filter/filter";
import { CheckboxType } from "../checkbox/checkbox";
import "./filter-options-dropdown.scss";
export interface FilterOption {
    label: string;
    value: FilterMode;
    svg: string;
    checkType?: CheckboxType;
}
export interface FilterOptionsDropdownProps {
    selectedOption: FilterMode;
    onSelectOption: (o: FilterMode) => void;
    filterOptions?: FilterOption[];
}
export declare class FilterOptionsDropdown extends React.Component<FilterOptionsDropdownProps> {
    static getFilterOptions(...filterTypes: string[]): FilterOption[];
    onSelectOption: (option: FilterOption) => void;
    renderFilterOption: (option: FilterOption) => JSX.Element;
    render(): JSX.Element;
}
