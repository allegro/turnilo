import { Datum } from "plywood";
import { Essence } from "../../../../common/models/essence/essence";
import { FilterClause } from "../../../../common/models/filter-clause/filter-clause";
import { ScrollerPart } from "../../../components/scroller/scroller";
declare type ClickablePart = "body" | "top-gutter" | "left-gutter";
export declare function isClickablePart(part: ScrollerPart): part is ClickablePart;
interface Position {
    part: ClickablePart;
    x: number;
    y: number;
}
export default function createHighlightClauses(position: Position, essence: Essence, dataset: Datum[]): FilterClause[];
export {};
