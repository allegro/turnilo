import * as React from "react";
import { Customization } from "../../../common/models/customization/customization";
import { Essence } from "../../../common/models/essence/essence";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { Binary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { DataSetWithTabOptions } from "../../views/cube-view/cube-view";
export interface ShareMenuProps {
    essence: Essence;
    timekeeper: Timekeeper;
    openOn: Element;
    onClose: Fn;
    openUrlShortenerModal: Binary<string, string, void>;
    customization: Customization;
    urlForEssence: (essence: Essence) => string;
    getDownloadableDataset?: () => DataSetWithTabOptions;
}
export declare const ShareMenu: React.SFC<ShareMenuProps>;
