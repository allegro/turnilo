import { Duration, Timezone } from "chronoshift";
import * as React from "react";
import { DataCube } from "../../../common/models/data-cube/data-cube";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import "./auto-refresh-menu.scss";
export interface AutoRefreshMenuProps {
    openOn: Element;
    onClose: Fn;
    autoRefreshRate: Duration;
    setAutoRefreshRate: Unary<Duration, void>;
    refreshMaxTime: Fn;
    dataCube: DataCube;
    timekeeper: Timekeeper;
    timezone: Timezone;
}
export declare const AutoRefreshMenu: React.SFC<AutoRefreshMenuProps>;
