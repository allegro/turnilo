import * as React from "react";
import { AppSettings } from "../../../common/models/app-settings/app-settings";
import { Customization } from "../../../common/models/customization/customization";
import { Fn } from "../../../common/utils/general/general";
import "./no-data-view.scss";
export interface NoDataViewProps {
    appSettings?: AppSettings;
    onOpenAbout: Fn;
    customization?: Customization;
}
export declare const NoDataView: React.SFC<NoDataViewProps>;
