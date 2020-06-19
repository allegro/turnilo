import { DataCube } from "../../models/data-cube/data-cube";
import { Essence } from "../../models/essence/essence";
import { ViewDefinitionConverter } from "../view-definition-converter";
import { ViewDefinition4 } from "./view-definition-4";
export declare class ViewDefinitionConverter4 implements ViewDefinitionConverter<ViewDefinition4, Essence> {
    version: number;
    fromViewDefinition(definition: ViewDefinition4, dataCube: DataCube): Essence;
    toViewDefinition(essence: Essence): ViewDefinition4;
}
