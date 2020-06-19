import { MeasureOrGroupForView } from "./measures-converter";
import { MeasureClickHandler, MeasureDragStartHandler } from "./measures-tile";
export declare class MeasuresRenderer {
    private readonly measureClick;
    private readonly measureDragStart;
    private readonly searchText;
    constructor(measureClick: MeasureClickHandler, measureDragStart: MeasureDragStartHandler, searchText: string);
    render(children: MeasureOrGroupForView[]): JSX.Element[];
    private renderFolder;
    private renderMeasure;
}
