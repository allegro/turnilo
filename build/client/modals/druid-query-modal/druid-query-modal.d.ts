import * as React from "react";
import { Essence } from "../../../common/models/essence/essence";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { Fn } from "../../../common/utils/general/general";
interface DruidQueryModalProps {
    onClose: Fn;
    essence: Essence;
    timekeeper: Timekeeper;
}
export declare const DruidQueryModal: React.SFC<DruidQueryModalProps>;
export {};
