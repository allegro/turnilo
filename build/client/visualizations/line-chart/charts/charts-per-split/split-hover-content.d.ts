import { Dataset } from "plywood";
import * as React from "react";
import { Essence } from "../../../../../common/models/essence/essence";
import { Hover } from "../../interactions/interaction";
interface SplitHoverContentProps {
    interaction: Hover;
    essence: Essence;
    dataset: Dataset;
}
export declare const SplitHoverContent: React.SFC<SplitHoverContentProps>;
export {};
