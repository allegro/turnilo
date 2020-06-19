import { Timezone } from "chronoshift";
import { List } from "immutable";
import { PseudoDatum } from "plywood";
import * as React from "react";
import { Split } from "../../../../../common/models/split/split";
import "./flattened-split-columns.scss";
interface FlattenedSplitColumnsProps {
    splits: List<Split>;
    datum: PseudoDatum;
    timezone: Timezone;
}
export declare const FlattenedSplitColumns: React.SFC<FlattenedSplitColumnsProps>;
export {};
