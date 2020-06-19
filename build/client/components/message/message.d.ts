import * as React from "react";
import "./message.scss";
declare type MessageLevel = "error" | "notice";
interface ErrorProps {
    content: string;
    title?: string;
    level?: MessageLevel;
}
export declare const Message: React.SFC<ErrorProps>;
export {};
