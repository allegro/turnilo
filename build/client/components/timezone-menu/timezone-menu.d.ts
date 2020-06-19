import { Timezone } from "chronoshift";
import * as React from "react";
import { Fn } from "../../../common/utils/general/general";
import "./timezone-menu.scss";
export interface TimezoneMenuProps {
    openOn: Element;
    onClose: Fn;
    changeTimezone?: (timezone: Timezone) => void;
    timezone?: Timezone;
    timezones?: Timezone[];
}
export declare const TimezoneMenu: React.SFC<TimezoneMenuProps>;
