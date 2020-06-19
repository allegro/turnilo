import * as React from "react";
import { Customization } from "../../../common/models/customization/customization";
import { DataCube } from "../../../common/models/data-cube/data-cube";
import { Essence } from "../../../common/models/essence/essence";
import { Binary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import "./side-drawer.scss";
export interface SideDrawerProps {
    essence: Essence;
    dataCubes: DataCube[];
    onOpenAbout: Fn;
    onClose: Fn;
    customization?: Customization;
    changeDataCubeAndEssence: Binary<DataCube, Essence | null, void>;
}
export interface SideDrawerState {
    query: string;
}
export declare class SideDrawer extends React.Component<SideDrawerProps, SideDrawerState> {
    state: {
        query: string;
    };
    queryChange: (query: string) => void;
    globalMouseDownListener: (e: MouseEvent) => void;
    globalKeyDownListener: (e: KeyboardEvent) => void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    private renderNavLogo;
    private renderHomeLink;
    navigateToCube: (dataCube: DataCube) => void;
    private renderDataCubeList;
    private renderDataCubes;
    private infoLink;
    render(): JSX.Element;
}
