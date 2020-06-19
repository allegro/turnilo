import * as React from "react";
import { Fn } from "../../../common/utils/general/general";
import "./nav-list.scss";
export interface NavLink {
    name: string;
    title: string;
    href: string;
    newTab?: boolean;
    tooltip?: string;
}
export interface NavAction {
    name: string;
    title: string;
    onClick: Fn;
    tooltip?: string;
}
export declare type NavItem = NavLink | NavAction;
export interface NavListProps {
    title?: string;
    navLinks: NavItem[];
    iconSvg?: string;
    selected?: string;
}
export declare const NavList: React.SFC<NavListProps>;
