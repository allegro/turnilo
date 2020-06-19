import { Essence } from "../models/essence/essence";
import { Visualization } from "../models/visualization-manifest/visualization-manifest";
import { ViewDefinition2 } from "./version-2/view-definition-2";
import { ViewDefinition3 } from "./version-3/view-definition-3";
import { ViewDefinition4 } from "./version-4/view-definition-4";
import { ViewDefinitionConverter } from "./view-definition-converter";
import { ViewDefinitionHashEncoder } from "./view-definition-hash-encoder";
export declare type ViewDefinition = ViewDefinition2 | ViewDefinition3 | ViewDefinition4;
export declare type ViewDefinitionVersion = "2" | "3" | "4";
export declare const DEFAULT_VIEW_DEFINITION_VERSION = "4";
export declare const LEGACY_VIEW_DEFINITION_VERSION = "2";
export declare const definitionConverters: {
    [version in ViewDefinitionVersion]: ViewDefinitionConverter<ViewDefinition, Essence>;
};
export declare const definitionUrlEncoders: {
    [version in ViewDefinitionVersion]: ViewDefinitionHashEncoder<ViewDefinition>;
};
export declare const defaultDefinitionConverter: ViewDefinitionConverter<ViewDefinition, Essence>;
export declare const defaultDefinitionUrlEncoder: ViewDefinitionHashEncoder<ViewDefinition>;
export declare const version2Visualizations: Set<Visualization>;
