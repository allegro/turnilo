import { DimensionClickHandler } from "./dimension-item";
import { DimensionOrGroupForView } from "./dimensions-converter";
export declare class DimensionsRenderer {
    private readonly dimensionClick;
    private readonly dimensionDragStart;
    private readonly searchText;
    constructor(dimensionClick: DimensionClickHandler, dimensionDragStart: DimensionClickHandler, searchText: string);
    render(children: DimensionOrGroupForView[]): JSX.Element[];
    private renderFolder;
    private renderDimension;
}
