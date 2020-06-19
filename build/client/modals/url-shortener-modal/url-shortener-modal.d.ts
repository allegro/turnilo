import * as React from "react";
import { Fn } from "../../../common/utils/general/general";
import "./url-shortener-modal.scss";
interface UrlShortenerModalProps {
    onClose: Fn;
    title: string;
}
interface UrlProp {
    url: string;
}
export declare const UrlShortenerModal: React.SFC<UrlShortenerModalProps & UrlProp>;
interface UrlShortenerPromptState {
    shortUrl: string;
    error?: string;
}
export declare class UrlShortenerPrompt extends React.Component<UrlProp, UrlShortenerPromptState> {
    state: UrlShortenerPromptState;
    componentDidMount(): void;
    shortenUrl(): Promise<any>;
    renderShortUrl(): any;
    render(): JSX.Element;
}
interface UrlState {
    copied: boolean;
}
export declare class ShortUrl extends React.Component<UrlProp, UrlState> {
    state: {
        copied: boolean;
    };
    copiedUrl: () => void;
    render(): JSX.Element;
}
export declare class LongUrl extends React.Component<UrlProp, UrlState> {
    state: {
        copied: boolean;
    };
    copiedUrl: () => void;
    render(): JSX.Element;
}
export {};
