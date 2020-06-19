import * as React from "react";
import { Dimension } from "../../../common/models/dimension/dimension";
import { Fn } from "../../../common/utils/general/general";
import "./segment-action-buttons.scss";
export interface SegmentActionButtonsProps {
    acceptHighlight: Fn;
    dropHighlight: Fn;
    dimension?: Dimension;
    segmentLabel?: string;
    segmentValue?: string;
    disableMoreMenu?: boolean;
    openRawDataModal?: Fn;
    onClose?: Fn;
}
export interface SegmentActionButtonsState {
    moreMenuOpenOn?: Element;
}
export declare class SegmentActionButtons extends React.Component<SegmentActionButtonsProps, SegmentActionButtonsState> {
    constructor(props: SegmentActionButtonsProps);
    onSelect: () => void;
    onCancel: () => void;
    onMore: (e: React.MouseEvent<HTMLElement>) => void;
    closeMoreMenu: () => void;
    getUrl(): string;
    openRawDataModal: () => void;
    renderMoreMenu(): JSX.Element;
    render(): JSX.Element;
}
