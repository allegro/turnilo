import * as React from "react";
import { DataCube } from "../../../common/models/data-cube/data-cube";
import { Fn } from "../../../common/utils/general/general";
export interface DebugMenuProps {
    openOn: Element;
    onClose: Fn;
    openRawDataModal: Fn;
    openViewDefinitionModal: Fn;
    openDruidQueryModal: Fn;
    dataCube: DataCube;
}
export declare const DebugMenu: React.SFC<DebugMenuProps>;
