import * as React from "react";
import { Dimension } from "../../../common/models/dimension/dimension";
import { Essence } from "../../../common/models/essence/essence";
import { Stage } from "../../../common/models/stage/stage";
import { Unary } from "../../../common/utils/functional/functional";
interface AddSplitProps {
    appendSplit: Unary<Dimension, void>;
    menuStage: Stage;
    essence: Essence;
}
export declare const AddSplit: React.SFC<AddSplitProps>;
export {};
