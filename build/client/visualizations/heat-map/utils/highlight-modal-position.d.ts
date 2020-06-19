import { HeatmapHighlightModalProps } from "../heatmap-highlight-modal";
export declare type CoordinatesProps = Pick<HeatmapHighlightModalProps, "position" | "layout" | "stage" | "scroll">;
export declare function calculateLeft(props: CoordinatesProps): number;
export declare function calculateTop(props: CoordinatesProps): number;
