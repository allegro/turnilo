import * as React from "react";
import "./router.scss";
export declare type Inflater = (key: string, value: string) => {
    key: string;
    value: any;
};
export interface RouteProps {
    fragment: string;
    alwaysShowOrphans?: boolean;
    transmit?: string[];
    inflate?: Inflater;
}
export interface RouteState {
}
export declare class Route extends React.Component<RouteProps, RouteState> {
}
export interface QualifiedPath {
    route: JSX.Element;
    fragment: string;
    crumbs: string[];
    wasDefaultChoice?: boolean;
    properties?: any;
    orphans?: JSX.Element[];
    parentRoutes: JSX.Element[];
}
export interface RouterProps {
    onURLChange: (breadCrumbs: string[]) => void;
    rootFragment?: string;
}
export interface RouterState {
    hash?: string;
}
export declare class Router extends React.Component<RouterProps, RouterState> {
    mounted: boolean;
    state: RouterState;
    componentDidMount(): void;
    componentWillUnmount(): void;
    globalHashChangeListener: () => void;
    removeRootFragmentFromHash(hash: string): string;
    componentWillReceiveProps(nextProps: RouterProps): void;
    parseHash(hash: string): string[];
    sanitizeHash(hash: string): string;
    replaceHash(newHash: string): void;
    hasExtraFragments(path: QualifiedPath): boolean;
    stripUnnecessaryFragments(path: QualifiedPath, crumbs: string[]): void;
    onHashChange(hash: string): void;
    getDefaultDeeperCrumbs(fragment: string, crumbs: string[]): string[];
    canDefaultDeeper(fragment: string, crumbs: string[]): boolean;
    getDefaultFragment(children: JSX.Element[]): string;
    getQualifiedPath(candidates: JSX.Element[], crumbs: string[], properties?: {}, orphans?: JSX.Element[], parentRoutes?: JSX.Element[]): QualifiedPath;
    hasSingleChild(route: JSX.Element): boolean;
    isRoute(candidate: JSX.Element): boolean;
    isAComment(candidate: JSX.Element): boolean;
    isSimpleChild(candidate: JSX.Element): boolean;
    getSimpleChildren(parent: JSX.Element): JSX.Element[];
    getPropertiesFromCrumbs(crumbs: string[], fragment: string, props?: any): any;
    inflate(pump: Inflater, properties: any): any;
    fillProperties(child: JSX.Element, path: QualifiedPath, i?: number): JSX.Element;
    getQualifiedChild(candidates: JSX.Element[], crumbs: string[]): JSX.Element | JSX.Element[];
    render(): JSX.Element;
}
