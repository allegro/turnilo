import { Duration, Timezone } from "chronoshift";
import * as React from "react";
import { Clicker } from "../../../../common/models/clicker/clicker";
import { Customization } from "../../../../common/models/customization/customization";
import { Essence } from "../../../../common/models/essence/essence";
import { Timekeeper } from "../../../../common/models/timekeeper/timekeeper";
import { Binary } from "../../../../common/utils/functional/functional";
import { Fn } from "../../../../common/utils/general/general";
import { DataSetWithTabOptions } from "../cube-view";
import "./cube-header-bar.scss";
export interface CubeHeaderBarProps {
    clicker: Clicker;
    essence: Essence;
    timekeeper: Timekeeper;
    onNavClick: Fn;
    urlForEssence: (essence: Essence) => string;
    refreshMaxTime?: Fn;
    updatingMaxTime?: boolean;
    openRawDataModal?: Fn;
    openViewDefinitionModal?: Fn;
    openDruidQueryModal?: Fn;
    openUrlShortenerModal?: Binary<string, string, void>;
    customization?: Customization;
    getDownloadableDataset?: () => DataSetWithTabOptions;
    changeTimezone?: (timezone: Timezone) => void;
}
export interface CubeHeaderBarState {
    shareMenuAnchor?: Element;
    autoRefreshMenuAnchor?: Element;
    autoRefreshRate?: Duration;
    timezoneMenuAnchor?: Element;
    debugMenuAnchor?: Element;
    animating?: boolean;
}
export declare class CubeHeaderBar extends React.Component<CubeHeaderBarProps, CubeHeaderBarState> {
    mounted: boolean;
    private autoRefreshTimer;
    state: CubeHeaderBarState;
    componentDidMount(): void;
    componentWillReceiveProps(nextProps: CubeHeaderBarProps): void;
    componentWillUnmount(): void;
    setAutoRefreshRate: (rate: Duration) => void;
    clearTimerIfExists(): void;
    toggleShareMenu: (e: React.MouseEvent<Element>) => void;
    openShareMenu: (anchor: Element) => void;
    closeShareMenu: () => void;
    renderShareMenu(): JSX.Element;
    toggleAutoRefreshMenu: (e: React.MouseEvent<Element>) => void;
    openAutoRefreshMenu: (anchor: Element) => void;
    closeAutoRefreshMenu: () => void;
    renderAutoRefreshMenu(): JSX.Element;
    toggleTimezoneMenu: (e: React.MouseEvent<Element>) => void;
    openTimezoneMenu: (anchor: Element) => void;
    closeTimezoneMenu: () => void;
    renderTimezoneMenu(): JSX.Element;
    toggleDebugMenu: (e: React.MouseEvent<Element>) => void;
    openDebugMenu: (anchor: Element) => void;
    closeDebugMenu: () => void;
    renderDebugMenu(): JSX.Element;
    render(): JSX.Element;
    private renderRightBar;
    private renderLeftBar;
}
