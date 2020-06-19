import { ViewDefinitionHashEncoder } from "../view-definition-hash-encoder";
import { ViewDefinition3 } from "./view-definition-3";
export declare class ViewDefinitionHashEncoder3 implements ViewDefinitionHashEncoder<ViewDefinition3> {
    decodeUrlHash(urlHash: string, visualization: string): ViewDefinition3;
    encodeUrlHash(definition: ViewDefinition3): string;
}
