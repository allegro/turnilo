import { DataCube } from "../../models/data-cube/data-cube";
import { Essence } from "../../models/essence/essence";
import { ViewDefinitionConverter } from "../view-definition-converter";
import { ViewDefinition3 } from "./view-definition-3";
export declare class ViewDefinitionConverter3 implements ViewDefinitionConverter<ViewDefinition3, Essence> {
    version: number;
    fromViewDefinition(definition: ViewDefinition3, dataCube: DataCube): Essence;
    toViewDefinition(essence: Essence): ViewDefinition3;
}
