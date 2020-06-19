import { Set } from "immutable";
import * as React from "react";
import { Clicker } from "../../../../common/models/clicker/clicker";
import { Dimension } from "../../../../common/models/dimension/dimension";
import { DragPosition } from "../../../../common/models/drag-position/drag-position";
import { Essence } from "../../../../common/models/essence/essence";
import { Filter } from "../../../../common/models/filter/filter";
import { Stage } from "../../../../common/models/stage/stage";
import { Timekeeper } from "../../../../common/models/timekeeper/timekeeper";
import { Fn } from "../../../../common/utils/general/general";
import "./boolean-filter-menu.scss";
interface BooleanFilterMenuProps {
    clicker: Clicker;
    dimension: Dimension;
    essence: Essence;
    timekeeper: Timekeeper;
    changePosition: DragPosition;
    onClose: Fn;
    containerStage?: Stage;
    openOn: Element;
    inside?: Element;
}
export declare type Booleanish = string | boolean;
interface BooleanFilterMenuState {
    loading?: boolean;
    error?: Error;
    values: Booleanish[];
    selectedValues: Set<Booleanish>;
}
export declare class BooleanFilterMenu extends React.Component<BooleanFilterMenuProps, BooleanFilterMenuState> {
    state: BooleanFilterMenuState;
    initialValues(): BooleanFilterMenuState;
    componentDidMount(): void;
    fetchData(): void;
    constructFilter(): Filter | null;
    actionEnabled(): boolean;
    onOkClick: () => void;
    onCancelClick: () => void;
    selectValue: (value: string | boolean) => void;
    renderRow: (value: string | boolean) => JSX.Element;
    render(): JSX.Element;
}
export {};
