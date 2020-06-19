import * as React from "react";
import { Customization } from "../../../common/models/customization/customization";
import "./header-bar.scss";
export interface HeaderBarProps {
    customization?: Customization;
    title?: string;
}
export declare const HeaderBar: React.SFC<HeaderBarProps>;
