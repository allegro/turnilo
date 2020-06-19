import { ViewDefinitionHashEncoder } from "../view-definition-hash-encoder";
import { ViewDefinition2 } from "./view-definition-2";
export declare class ViewDefinitionHashEncoder2 implements ViewDefinitionHashEncoder<ViewDefinition2> {
    decodeUrlHash(urlHash: string, visualization: string): ViewDefinition2;
    encodeUrlHash(definition: ViewDefinition2): string;
}
