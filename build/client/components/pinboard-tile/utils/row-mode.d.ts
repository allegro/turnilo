import { Unary } from "../../../../common/utils/functional/functional";
import { PinnableClause } from "./pinnable-clause";
export declare enum RowModeId {
    READONLY = 0,
    EDITABLE = 1
}
export interface ReadonlyMode {
    mode: RowModeId.READONLY;
}
export declare enum EditState {
    READY = 0,
    IN_EDIT = 1
}
export interface InEditMode {
    mode: RowModeId.EDITABLE;
    state: EditState.IN_EDIT;
    toggleValue: Unary<string, void>;
    clause: PinnableClause;
}
export interface ReadyToEditMode {
    mode: RowModeId.EDITABLE;
    state: EditState.READY;
    createClause: Unary<string, void>;
}
export declare type RowMode = ReadonlyMode | InEditMode | ReadyToEditMode;
