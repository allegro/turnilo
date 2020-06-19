import { Timezone } from "chronoshift";
import { Dataset, TabulatorOptions } from "plywood";
import * as React from "react";
import { AppSettings } from "../../../common/models/app-settings/app-settings";
import { Customization } from "../../../common/models/customization/customization";
import { DataCube } from "../../../common/models/data-cube/data-cube";
import { DeviceSize } from "../../../common/models/device/device";
import { Dimension } from "../../../common/models/dimension/dimension";
import { Essence } from "../../../common/models/essence/essence";
import { Series } from "../../../common/models/series/series";
import { Stage } from "../../../common/models/stage/stage";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { Binary, Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import "./cube-view.scss";
export interface CubeViewLayout {
    factPanel: {
        width: number;
        hidden?: boolean;
    };
    pinboard: {
        width: number;
        hidden?: boolean;
    };
}
export interface CubeViewProps {
    initTimekeeper?: Timekeeper;
    maxFilters?: number;
    hash: string;
    changeDataCubeAndEssence: Binary<DataCube, Essence | null, void>;
    changeEssence: Binary<Essence, boolean, void>;
    urlForEssence: Unary<Essence, string>;
    getEssenceFromHash: Binary<string, DataCube, Essence>;
    dataCube: DataCube;
    openAboutModal: Fn;
    customization?: Customization;
    appSettings: AppSettings;
}
export interface CubeViewState {
    essence?: Essence;
    timekeeper?: Timekeeper;
    visualizationStage?: Stage;
    menuStage?: Stage;
    dragOver?: boolean;
    showSideBar?: boolean;
    showRawDataModal?: boolean;
    showViewDefinitionModal?: boolean;
    showDruidQueryModal?: boolean;
    urlShortenerModalProps?: {
        url: string;
        title: string;
    };
    layout?: CubeViewLayout;
    deviceSize?: DeviceSize;
    updatingMaxTime?: boolean;
    lastRefreshRequestTimestamp: number;
}
export interface DataSetWithTabOptions {
    dataset: Dataset;
    options?: TabulatorOptions;
}
export declare class CubeView extends React.Component<CubeViewProps, CubeViewState> {
    static defaultProps: Partial<CubeViewProps>;
    private static canDrop;
    mounted: boolean;
    private readonly clicker;
    private downloadableDataset;
    private visualization;
    private container;
    private filterTile;
    private seriesTile;
    private splitTile;
    constructor(props: CubeViewProps);
    refreshMaxTime: () => void;
    componentWillMount(): void;
    componentDidMount(): void;
    componentWillReceiveProps(nextProps: CubeViewProps): void;
    componentWillUpdate(nextProps: CubeViewProps, nextState: CubeViewState): void;
    componentDidUpdate(prevProps: CubeViewProps, { layout: { pinboard: prevPinboard, factPanel: prevFactPanel } }: CubeViewState): void;
    componentWillUnmount(): void;
    updateEssenceFromHashOrDataCube(hash: string, dataCube: DataCube): void;
    getEssenceFromDataCube(dataCube: DataCube): Essence;
    getEssenceFromHash(hash: string, dataCube: DataCube): Essence;
    globalResizeListener: () => void;
    private isSmallDevice;
    dragEnter: (e: React.DragEvent<HTMLElement>) => void;
    dragOver: (e: React.DragEvent<HTMLElement>) => void;
    dragLeave: () => void;
    drop: (e: React.DragEvent<HTMLElement>) => void;
    openRawDataModal: () => void;
    onRawDataModalClose: () => void;
    renderRawDataModal(): JSX.Element;
    openViewDefinitionModal: () => void;
    onViewDefinitionModalClose: () => void;
    renderViewDefinitionModal(): JSX.Element;
    openDruidQueryModal: () => void;
    closeDruidQueryModal: () => void;
    renderDruidQueryModal(): JSX.Element;
    openUrlShortenerModal: (url: string, title: string) => void;
    closeUrlShortenerModal: () => void;
    renderUrlShortenerModal(): JSX.Element;
    triggerFilterMenu: (dimension: Dimension) => void;
    appendDirtySeries: (series: Series) => void;
    changeTimezone: (newTimezone: Timezone) => void;
    getStoredLayout(): CubeViewLayout;
    storeLayout(layout: CubeViewLayout): void;
    private updateLayout;
    toggleFactPanel: () => void;
    togglePinboard: () => void;
    onFactPanelResize: (width: number) => void;
    onPinboardPanelResize: (width: number) => void;
    onPanelResizeEnd: () => void;
    private getCubeContext;
    private constructContext;
    render(): JSX.Element;
    sideDrawerOpen: () => void;
    sideDrawerClose: () => void;
    renderSideDrawer(): JSX.Element;
    private calculateStyles;
    private manualFallback;
    private visElement;
}
