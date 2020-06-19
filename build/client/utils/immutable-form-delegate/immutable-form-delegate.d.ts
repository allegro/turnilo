import * as React from "react";
export interface FormItem {
    change: (propName: string, propValue: any) => FormItem;
}
export declare type ChangeFn = (myInstance: any, valid: boolean, path?: string, error?: string) => void;
export interface ImmutableFormState<T> {
    newInstance?: T;
    canSave?: boolean;
    errors?: any;
}
export declare class ImmutableFormDelegate<T> {
    private form;
    constructor(form: React.Component<any, ImmutableFormState<T>>);
    private setState;
    updateErrors: (path: string, isValid: boolean, error: string) => {
        errors: any;
        canSave: boolean;
    };
    onChange: (newItem: any, isValid: boolean, path: string, error: string) => void;
}
