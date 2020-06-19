import * as React from "react";
import { Component, DragEvent, MouseEvent } from "react";
import { Clicker } from "../../../common/models/clicker/clicker";
import { Essence } from "../../../common/models/essence/essence";
import { Measure } from "../../../common/models/measure/measure";
import { Series } from "../../../common/models/series/series";
import { Stage } from "../../../common/models/stage/stage";
import { Unary } from "../../../common/utils/functional/functional";
import { MeasureOrGroupForView } from "./measures-converter";
export interface MeasuresTileProps {
    clicker: Clicker;
    essence: Essence;
    menuStage: Stage;
    appendDirtySeries: Unary<Series, void>;
    style?: React.CSSProperties;
}
export interface MeasuresTileState {
    menuOpenOn?: Element;
    menuMeasure?: Measure;
    showSearch?: boolean;
    searchText?: string;
}
export declare type MeasureClickHandler = (measureName: string, e: MouseEvent<HTMLElement>) => void;
export declare type MeasureDragStartHandler = (measureName: string, e: DragEvent<HTMLElement>) => void;
export declare class MeasuresTile extends Component<MeasuresTileProps, MeasuresTileState> {
    readonly state: MeasuresTileState;
    measureClick: (measureName: string, e: React.MouseEvent<HTMLElement>) => void;
    closeMenu: () => void;
    dragStart: (measureName: string, e: React.DragEvent<HTMLElement>) => void;
    toggleSearch: () => void;
    onSearchChange: (text: string) => void;
    renderMessageIfNoMeasuresFound(measuresForView: MeasureOrGroupForView[]): JSX.Element;
    render(): JSX.Element;
    private addSeries;
    private renderMenu;
}
