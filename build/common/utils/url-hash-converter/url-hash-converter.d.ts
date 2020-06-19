import { DataCube } from "../../models/data-cube/data-cube";
import { Essence } from "../../models/essence/essence";
import { ViewDefinitionVersion } from "../../view-definitions";
export interface UrlHashConverter {
    essenceFromHash(hash: string, dataCube: DataCube): Essence;
    toHash(essence: Essence, version?: ViewDefinitionVersion): string;
}
interface HashSegments {
    readonly version: ViewDefinitionVersion;
    readonly encodedModel: string;
    readonly visualization?: string;
}
export declare function getHashSegments(hash: string): HashSegments;
export declare const urlHashConverter: UrlHashConverter;
export {};
