import { Set } from "immutable";
import * as React from "react";
import { Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import "./paste-form.scss";
interface PasteFormProps {
    onSelect: Unary<Set<string>, void>;
    onClose: Fn;
}
interface PasteFormState {
    value: string;
}
export declare class PasteForm extends React.Component<PasteFormProps, PasteFormState> {
    state: PasteFormState;
    values: () => Set<string>;
    select: () => void;
    cancel: () => void;
    saveValue: ({ target: { value } }: React.ChangeEvent<HTMLTextAreaElement>) => void;
    render(): JSX.Element;
}
export {};
