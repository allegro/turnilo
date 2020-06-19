import { List } from "immutable";
import { Dataset } from "plywood";
import * as React from "react";
import { FilterClause } from "../../../common/models/filter-clause/filter-clause";
import { Series } from "../../../common/models/series/series";
import { Visualization } from "../../../common/models/visualization-manifest/visualization-manifest";
import { DatasetLoad, VisualizationProps } from "../../../common/models/visualization-props/visualization-props";
import "./base-visualization.scss";
import { Highlight } from "./highlight";
export interface BaseVisualizationState {
    datasetLoad?: DatasetLoad;
    dragOnSeries: Series | null;
    scrollLeft?: number;
    scrollTop?: number;
    highlight: Highlight | null;
}
export declare class BaseVisualization<S extends BaseVisualizationState> extends React.Component<VisualizationProps, S> {
    protected className: Visualization;
    constructor(props: VisualizationProps);
    protected getDefaultState(): BaseVisualizationState;
    protected globalMouseMoveListener: (e: MouseEvent) => void;
    protected globalMouseUpListener: (e: MouseEvent) => void;
    protected globalKeyDownListener: (e: KeyboardEvent) => void;
    private lastQueryEssence;
    componentDidMount(): void;
    componentWillUnmount(): void;
    componentWillReceiveProps(nextProps: VisualizationProps): void;
    private loadData;
    private fetchData;
    private callExecutor;
    private wasUsedForLastQuery;
    private debouncedCallExecutor;
    private handleDatasetLoad;
    protected shouldFetchData(nextProps: VisualizationProps): boolean;
    protected differentVisualizationDefinition(nextProps: VisualizationProps): boolean;
    private differentBucketingTimezone;
    private differentLastRefreshRequestTimestamp;
    private visualisationNotResized;
    protected renderInternals(dataset: Dataset): JSX.Element;
    protected getHighlight(): Highlight | null;
    protected hasHighlight(): boolean;
    protected highlightOn(key: string): boolean;
    protected getHighlightClauses(): List<FilterClause>;
    protected dropHighlight: () => void;
    protected acceptHighlight: () => void;
    protected highlight: (clauses: List<FilterClause>, key?: string) => void;
    deriveDatasetState(dataset: Dataset): Partial<S>;
    render(): JSX.Element;
}
