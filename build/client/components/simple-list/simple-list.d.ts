import * as React from "react";
import "./simple-list.scss";
export interface SimpleRow {
    title: string;
    description?: string;
    icon?: string;
}
export interface SimpleListProps {
    rows: SimpleRow[];
    onEdit?: (index: number) => void;
    onRemove?: (index: number) => void;
    onReorder?: (oldIndex: number, newIndex: number) => void;
}
export interface SimpleListState {
    draggedItem?: SimpleRow;
    dropIndex?: number;
}
export declare class SimpleList extends React.Component<SimpleListProps, SimpleListState> {
    constructor(props: SimpleListProps);
    dragStart(item: SimpleRow, e: DragEvent): void;
    isInTopHalf(e: DragEvent): boolean;
    dragOver(item: SimpleRow, e: DragEvent): void;
    dragEnd: (e: React.DragEvent<HTMLElement>) => void;
    renderRows(rows: SimpleRow[]): JSX.Element[];
    render(): JSX.Element;
}
