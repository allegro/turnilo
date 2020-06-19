import * as React from "react";
import { AppSettings } from "../../../common/models/app-settings/app-settings";
import { DataCube } from "../../../common/models/data-cube/data-cube";
import { Essence } from "../../../common/models/essence/essence";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import "./turnilo-application.scss";
export interface TurniloApplicationProps {
    version: string;
    maxFilters?: number;
    appSettings: AppSettings;
    initTimekeeper?: Timekeeper;
}
export interface TurniloApplicationState {
    appSettings?: AppSettings;
    timekeeper?: Timekeeper;
    drawerOpen?: boolean;
    selectedItem?: DataCube;
    viewType?: ViewType;
    viewHash?: string;
    showAboutModal?: boolean;
    errorId?: string;
}
export declare type ViewType = "home" | "cube" | "no-data" | "general-error";
export declare const HOME: ViewType;
export declare const CUBE: ViewType;
export declare const NO_DATA: ViewType;
export declare class TurniloApplication extends React.Component<TurniloApplicationProps, TurniloApplicationState> {
    private hashUpdating;
    private readonly urlHashConverter;
    state: TurniloApplicationState;
    componentDidCatch(error: Error): void;
    componentWillMount(): void;
    viewTypeNeedsAnItem(viewType: ViewType): boolean;
    componentDidMount(): void;
    componentWillUnmount(): void;
    globalHashChangeListener: () => void;
    hashToState(hash: string): void;
    parseHash(hash: string): string[];
    getViewTypeFromHash(hash: string): ViewType;
    getSelectedDataCubeFromHash(dataCubes: DataCube[], hash: string): DataCube;
    getViewHashFromHash(hash: string): string;
    changeHash(hash: string, force?: boolean): void;
    updateEssenceInHash: (essence: Essence, force?: boolean) => void;
    changeDataCubeWithEssence: (dataCube: DataCube, essence: Essence) => void;
    urlForEssence: (essence: Essence) => string;
    private convertEssenceToHash;
    getUrlPrefix(): string;
    openAboutModal: () => void;
    onAboutModalClose: () => void;
    renderAboutModal(): JSX.Element;
    renderView(): JSX.Element;
    render(): JSX.Element;
}
