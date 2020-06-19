import { PureComponent } from "react";
import "./searchable-folder.scss";
export interface SearchableFolderProps {
    name: string;
    title: string;
    description?: string;
    inSearchMode: boolean;
    hasItemsWithSearchText: boolean;
    shouldBeOpened: boolean;
}
export interface SearchableFolderState {
    opened: boolean;
}
export declare class SearchableFolder extends PureComponent<SearchableFolderProps, SearchableFolderState> {
    readonly state: SearchableFolderState;
    private readonly openIcon;
    private readonly closedIcon;
    constructor(props: SearchableFolderProps);
    componentWillReceiveProps(nextProps: Readonly<SearchableFolderProps>): void;
    handleClick: () => void;
    render(): JSX.Element;
}
