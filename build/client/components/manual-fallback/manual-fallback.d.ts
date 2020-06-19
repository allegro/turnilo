import * as React from "react";
import { Clicker } from "../../../common/models/clicker/clicker";
import { Essence } from "../../../common/models/essence/essence";
import { Resolution } from "../../../common/models/visualization-manifest/visualization-manifest";
import "./manual-fallback.scss";
export interface ManualFallbackProps {
    clicker: Clicker;
    essence: Essence;
}
export declare class ManualFallback extends React.Component<ManualFallbackProps, {}> {
    onResolutionClick(resolution: Resolution): void;
    render(): JSX.Element;
}
