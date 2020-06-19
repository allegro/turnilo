import * as React from "react";
import { Unary } from "../../utils/functional/functional";
import { ImmutableRecord } from "../../utils/immutable-utils/immutable-utils";
interface VisualizationSettingsComponentProps<T> {
    onChange: Unary<ImmutableRecord<T>, void>;
    settings: ImmutableRecord<T>;
}
export declare type VisualizationSettingsComponent<T> = React.SFC<VisualizationSettingsComponentProps<T>>;
interface VisualizationSettingsConverter<T> {
    print: Unary<T, object>;
    read: Unary<unknown, ImmutableRecord<T>>;
}
declare type VisSettingsInternal = object;
export declare type VisualizationSettings<T extends VisSettingsInternal = object> = ImmutableRecord<VisSettingsInternal>;
export interface VisualizationSettingsConfig<T extends VisSettingsInternal> {
    converter: VisualizationSettingsConverter<T>;
    defaults: VisualizationSettings<T>;
}
export {};
