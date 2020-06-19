import { Datum } from "plywood";
import * as React from "react";
import { Essence } from "../../../../../common/models/essence/essence";
import "./label.scss";
interface LabelProps {
    essence: Essence;
    datum: Datum;
}
export declare const Label: React.SFC<LabelProps>;
export {};
