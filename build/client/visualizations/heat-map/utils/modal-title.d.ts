import { Datum } from "plywood";
import { Essence } from "../../../../common/models/essence/essence";
import { HighlightPosition } from "./get-highlight-position";
import { HoverPosition } from "./get-hover-position";
export declare function modalTitle(position: HighlightPosition | HoverPosition, dataset: Datum[], essence: Essence): string;
