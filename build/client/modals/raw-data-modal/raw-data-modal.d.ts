import { List } from "immutable";
import { AttributeInfo, Dataset } from "plywood";
import * as React from "react";
import { DataCube } from "../../../common/models/data-cube/data-cube";
import { Essence } from "../../../common/models/essence/essence";
import { Stage } from "../../../common/models/stage/stage";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { Fn } from "../../../common/utils/general/general";
import { FileFormat } from "../../utils/download/download";
import "./raw-data-modal.scss";
export interface RawDataModalProps {
    onClose: Fn;
    essence: Essence;
    timekeeper: Timekeeper;
}
export interface RawDataModalState {
    dataset?: Dataset;
    error?: Error;
    loading?: boolean;
    scrollLeft?: number;
    scrollTop?: number;
    stage?: Stage;
}
export declare class RawDataModal extends React.Component<RawDataModalProps, RawDataModalState> {
    mounted: boolean;
    constructor(props: RawDataModalProps);
    componentDidMount(): void;
    componentWillUnmount(): void;
    fetchData(essence: Essence, timekeeper: Timekeeper): void;
    onScrollerViewportUpdate: (viewPortStage: Stage) => void;
    onScroll: (scrollTop: number, scrollLeft: number) => void;
    getStringifiedFilters(): List<string>;
    getSortedAttributes(dataCube: DataCube): AttributeInfo[];
    renderFilters(): List<JSX.Element>;
    renderHeader(): JSX.Element[];
    getVisibleIndices(rowCount: number, height: number): number[];
    renderRows(): JSX.Element[];
    renderButtons(): JSX.Element;
    download(fileFormat: FileFormat): void;
    render(): JSX.Element;
}
