import * as React from "react";
import { Dimension } from "../../../common/models/dimension/dimension";
import { Essence } from "../../../common/models/essence/essence";
import { Sort } from "../../../common/models/sort/sort";
import { Split } from "../../../common/models/split/split";
import { Stage } from "../../../common/models/stage/stage";
import { Binary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import "./split-menu.scss";
export interface SplitMenuProps {
    essence: Essence;
    saveSplit: Binary<Split, Split, void>;
    openOn: Element;
    containerStage: Stage;
    onClose: Fn;
    dimension: Dimension;
    split: Split;
}
export interface SplitMenuState {
    reference?: string;
    granularity?: string;
    sort?: Sort;
    limit?: number;
}
export declare class SplitMenu extends React.Component<SplitMenuProps, SplitMenuState> {
    state: SplitMenuState;
    componentWillMount(): void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    globalKeyDownListener: (e: KeyboardEvent) => void;
    saveGranularity: (granularity: string) => void;
    saveSort: (sort: Sort) => void;
    saveLimit: (limit: number) => void;
    onCancelClick: () => void;
    onOkClick: () => void;
    private constructGranularity;
    private constructSplitCombine;
    validate(): boolean;
    renderSortDropdown(): JSX.Element;
    render(): JSX.Element;
}
