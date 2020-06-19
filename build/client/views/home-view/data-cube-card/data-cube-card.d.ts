import * as React from "react";
import "./data-cube-card.scss";
export interface DataCubeCardProps {
    title: string;
    count?: number;
    extendedDescription: string;
    description: string;
    icon: string;
    onClick: () => void;
}
export interface DataCubeCardState {
    showingMore: boolean;
}
export declare class DataCubeCard extends React.Component<DataCubeCardProps, DataCubeCardState> {
    state: {
        showingMore: boolean;
    };
    showLess: () => void;
    showMore: () => void;
    renderDescription(): JSX.Element;
    render(): JSX.Element;
}
