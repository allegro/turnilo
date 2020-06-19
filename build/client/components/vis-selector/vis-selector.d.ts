import * as React from "react";
import { Clicker } from "../../../common/models/clicker/clicker";
import { Essence } from "../../../common/models/essence/essence";
import { VisualizationManifest } from "../../../common/models/visualization-manifest/visualization-manifest";
import "./vis-selector.scss";
export interface VisSelectorProps {
    clicker: Clicker;
    essence: Essence;
}
export interface VisSelectorState {
    openMenu: boolean;
}
export declare class VisSelector extends React.Component<VisSelectorProps, VisSelectorState> {
    private selector;
    state: VisSelectorState;
    openMenu: (e: React.MouseEvent<HTMLElement>) => void;
    closeMenu: () => void;
    changeVisualization: (vis: VisualizationManifest<{}>, settings: import("../../../common/utils/immutable-utils/immutable-utils").ImmutableRecord<object>) => void;
    renderMenu(): JSX.Element;
    render(): JSX.Element;
}
