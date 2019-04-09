declare module "@vx/*";

declare module "@vx/heatmap" {

  interface Bin {
    width: number;
    height: number;
    x: number;
    y: number;
    color: string;
    opacity: number;
    row: number;
    column: number;
  }

  export interface HeatmapRectProps {
    bins(rawDataPoint: any): any;
    count(rawDataPoint: any): number;
    data: any[];
    xScale: d3.scale.Linear<any, any>;
    yScale: d3.scale.Linear<any, any>;
    colorScale: d3.scale.Linear<any, any>;
    binWidth: number;
    binHeight: number;
    gap: number;
    children?: (heatmap: Bin[][]) => React.ReactNode;
  }
  export class HeatmapRect extends React.Component<HeatmapRectProps> {

  }
}

declare module "@vx/scale" {

  interface ScaleLinearOptions<Range, Output> {
    range: [Range, Range];
    domain: [number, number];
  }

  export const scaleLinear: <Range, Output = any>(options: ScaleLinearOptions<Range, Output>) => d3.scale.Linear<number, number>;
}

declare module '@vx/tooltip' {
  export interface WithTooltipProps<D> {
    tooltipOpen: boolean;
    tooltipLeft: number;
    tooltipTop: number;
    tooltipData: D;
    hideTooltip: () => void;
    showTooltip: (
      args: { tooltipLeft: number; tooltipTop: number; tooltipData: D }
    ) => void;
  }
  export const withTooltip: <P>(component: React.ComponentType<P & WithTooltipProps<any>>, options: any) => React.ComponentType<P>;

  interface TooltipWithBoundsProps {
    key: number | string;
    top: number;
    left: number;
    children: React.ReactNode;
  }
  const TooltipWithBounds: React.ComponentType<TooltipWithBoundsProps>;
}
