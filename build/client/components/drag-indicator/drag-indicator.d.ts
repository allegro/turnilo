import * as React from "react";
import { DragPosition } from "../../../common/models/drag-position/drag-position";
import { Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
interface DragIndicatorProps {
    drop: Unary<React.DragEvent<HTMLElement>, void>;
    dragLeave: Fn;
    dragOver: Unary<React.DragEvent<HTMLElement>, void>;
    dragPosition?: DragPosition;
}
export declare const DragIndicator: React.SFC<DragIndicatorProps>;
export {};
