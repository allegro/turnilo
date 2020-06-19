import * as React from "react";
import { Customization } from "../../../common/models/customization/customization";
import { DataCube } from "../../../common/models/data-cube/data-cube";
import { Fn } from "../../../common/utils/general/general";
import "./home-view.scss";
export interface HomeViewProps {
    dataCubes?: DataCube[];
    onOpenAbout: Fn;
    customization?: Customization;
}
export interface HomeViewState {
    query: string;
}
export declare class HomeView extends React.Component<HomeViewProps, HomeViewState> {
    state: {
        query: string;
    };
    queryChange: (query: string) => void;
    renderDataCube({ name, title, description, extendedDescription }: DataCube): JSX.Element;
    renderDataCubes(): JSX.Element;
    render(): JSX.Element;
}
