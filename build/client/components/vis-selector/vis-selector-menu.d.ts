import * as React from "react";
import { VisualizationManifest } from "../../../common/models/visualization-manifest/visualization-manifest";
import { VisualizationSettings } from "../../../common/models/visualization-settings/visualization-settings";
import { Binary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { ImmutableRecord } from "../../../common/utils/immutable-utils/immutable-utils";
import "./vis-selector-menu.scss";
export interface VisSelectorMenuProps {
    onSelect: Binary<VisualizationManifest, VisualizationSettings, void>;
    initialVisualization: VisualizationManifest;
    initialSettings: VisualizationSettings;
    onClose: Fn;
}
interface VisSelectorMenuState {
    visualization: VisualizationManifest;
    visualizationSettings: VisualizationSettings;
}
export declare class VisSelectorMenu extends React.Component<VisSelectorMenuProps, VisSelectorMenuState> {
    state: VisSelectorMenuState;
    save: () => void;
    close: () => void;
    changeVisualization: (visualization: VisualizationManifest<{}>) => void;
    changeSettings: (visualizationSettings: ImmutableRecord<object>) => void;
    renderSettings(): JSX.Element;
    settingsComponent(): JSX.Element | null;
    render(): JSX.Element;
}
export {};
