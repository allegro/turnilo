import * as React from "react";
import { Fn } from "../../../common/utils/general/general";
import "./modal-bubble.scss";
interface ModalProps {
    left: number;
    top: number;
    onClose: Fn;
    className?: string;
}
export declare class ModalBubble extends React.Component<ModalProps, {}> {
    modalRef: HTMLDivElement;
    setModalRef: (el: HTMLDivElement) => void;
    onMouseDown: (e: MouseEvent) => void;
    render(): JSX.Element;
}
export {};
