import * as React from "react";
import "./tile-header.scss";
export interface TileHeaderIcon {
    name: string;
    svg: string;
    onClick: React.MouseEventHandler<HTMLElement>;
    ref?: string;
    active?: boolean;
}
export interface TileHeaderProps {
    title: string;
    onDragStart?: React.DragEventHandler<HTMLElement>;
    icons?: TileHeaderIcon[];
}
export interface TileHeaderState {
}
export declare class TileHeader extends React.Component<TileHeaderProps, TileHeaderState> {
    renderIcons(): JSX.Element;
    render(): JSX.Element;
}
