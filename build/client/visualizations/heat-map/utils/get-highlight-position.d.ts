import { Datum } from "plywood";
import { Essence } from "../../../../common/models/essence/essence";
import { Highlight } from "../../base-visualization/highlight";
export interface HighlightPosition {
    row: number | null;
    column: number | null;
}
export default function getHighlightPosition(highlight: Highlight, essence: Essence, dataset: Datum[]): HighlightPosition;
