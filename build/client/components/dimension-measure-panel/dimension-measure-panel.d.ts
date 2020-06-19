import * as React from "react";
import { Clicker } from "../../../common/models/clicker/clicker";
import { DataCube } from "../../../common/models/data-cube/data-cube";
import { Dimension } from "../../../common/models/dimension/dimension";
import { Essence } from "../../../common/models/essence/essence";
import { Series } from "../../../common/models/series/series";
import { Stage } from "../../../common/models/stage/stage";
import { Unary } from "../../../common/utils/functional/functional";
import "./dimension-measure-panel.scss";
export declare const MIN_PANEL_SIZE = 100;
export interface DimensionMeasurePanelProps {
    clicker: Clicker;
    essence: Essence;
    menuStage: Stage;
    triggerFilterMenu: (dimension: Dimension) => void;
    appendDirtySeries: Unary<Series, void>;
    style?: React.CSSProperties;
}
export interface DimensionMeasurePanelState {
    dividerPosition: number;
    containerHeight: number;
}
export declare function initialPosition(height: number, dataCube: DataCube): number;
export declare class DimensionMeasurePanel extends React.Component<DimensionMeasurePanelProps, DimensionMeasurePanelState> {
    state: DimensionMeasurePanelState;
    containerRef: Element;
    getInitialState: (container: Element) => void;
    saveDividerPosition: (dividerPosition: number) => void;
    saveContainerRect: () => void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    render(): JSX.Element;
}
