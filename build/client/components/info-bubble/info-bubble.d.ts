import * as React from "react";
import { Direction } from "../bubble-menu/bubble-menu";
import "./info-bubble.scss";
export interface InfoBubbleState {
    showInfo: {
        target: Element;
        direction: Direction;
    };
}
export interface InfoBubbleProps {
    description: string;
    icon?: string;
    title?: string;
    className?: string;
}
export declare class InfoBubble extends React.Component<InfoBubbleProps, InfoBubbleState> {
    showDescription: ({ currentTarget }: React.MouseEvent<HTMLElement>) => void;
    closeDescription: () => void;
    constructor(props: InfoBubbleProps);
    render(): JSX.Element;
}
