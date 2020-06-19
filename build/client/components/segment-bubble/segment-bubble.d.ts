import * as React from "react";
import { ReactNode } from "react";
import "./segment-bubble.scss";
export interface SegmentBubbleProps extends SegmentBubbleContentProps {
    left: number;
    top: number;
}
export declare const SegmentBubble: React.SFC<SegmentBubbleProps>;
export interface SegmentBubbleContentProps {
    title: string;
    content?: ReactNode;
}
export declare const SegmentBubbleContent: React.SFC<SegmentBubbleContentProps>;
