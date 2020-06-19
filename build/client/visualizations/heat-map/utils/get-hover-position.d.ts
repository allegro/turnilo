import { ScrollerLayout, ScrollerPart } from "../../../components/scroller/scroller";
import { LinearScale } from "./scales";
export interface HoverPosition {
    row: number;
    column: number;
    top: number;
    left: number;
}
export default function getHoverPosition(xScale: LinearScale, yScale: LinearScale, x: number, y: number, part: ScrollerPart, { left, top }: ScrollerLayout): HoverPosition | null;
