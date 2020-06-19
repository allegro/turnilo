import * as React from "react";
import { VisualizationManifest } from "../../../common/models/visualization-manifest/visualization-manifest";
import { Unary } from "../../../common/utils/functional/functional";
import "./vis-selector-item.scss";
interface VisSelectorItemProps {
    visualization: VisualizationManifest;
    selected: boolean;
    onClick?: Unary<VisualizationManifest, void>;
}
export declare const VisSelectorItem: React.SFC<VisSelectorItemProps>;
export {};
