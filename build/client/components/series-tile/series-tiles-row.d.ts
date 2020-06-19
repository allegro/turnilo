import * as React from "react";
import { DragPosition } from "../../../common/models/drag-position/drag-position";
import { Measure } from "../../../common/models/measure/measure";
import { Series } from "../../../common/models/series/series";
import { Stage } from "../../../common/models/stage/stage";
import { CubeContextValue } from "../../views/cube-view/cube-context";
import "./series-tiles-row.scss";
interface SeriesTilesRowProps {
    menuStage: Stage;
}
export interface Placeholder {
    series: Series;
    index: number;
}
interface SeriesTilesRowState {
    dragPosition?: DragPosition;
    openedSeries?: Series;
    overflowOpen?: boolean;
    placeholderSeries?: Placeholder;
}
export declare class SeriesTilesRow extends React.Component<SeriesTilesRowProps, SeriesTilesRowState> {
    static contextType: React.Context<CubeContextValue>;
    context: CubeContextValue;
    state: SeriesTilesRowState;
    private items;
    private maxItems;
    appendDirtySeries(series: Series): void;
    private appendPlaceholder;
    removePlaceholderSeries: () => void;
    openSeriesMenu: (series: Series) => void;
    closeSeriesMenu: () => void;
    openOverflowMenu: () => void;
    closeOverflowMenu: () => void;
    updateSeries: (oldSeries: Series, series: Series) => void;
    savePlaceholderSeries: (series: Series) => void;
    removeSeries: (series: Series) => void;
    canDrop(): boolean;
    dragStart: (label: string, series: Series, e: React.DragEvent<HTMLElement>) => void;
    calculateDragPosition(e: React.DragEvent<HTMLElement>): DragPosition;
    dragEnter: (e: React.DragEvent<HTMLElement>) => void;
    dragOver: (e: React.DragEvent<HTMLElement>) => void;
    dragLeave: () => void;
    drop: (e: React.DragEvent<HTMLElement>) => void;
    private dropNewSeries;
    private rearrangeSeries;
    appendMeasureSeries: (measure: Measure) => void;
    render(): JSX.Element;
}
export {};
