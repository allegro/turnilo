import * as React from "react";
import "./heatmap-labels.scss";
interface HeatmapLabelsProps {
    labels: string[];
    orientation: "top" | "left";
    hoveredLabel: number;
    highlightedLabel: number;
    labelSize?: number;
    onMaxLabelSize?(maxLabelSize: number): void;
}
export declare class HeatmapLabels extends React.Component<HeatmapLabelsProps> {
    private container;
    componentDidMount(): void;
    render(): JSX.Element;
}
export {};
