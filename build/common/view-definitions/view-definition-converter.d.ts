import { DataCube } from "../models/data-cube/data-cube";
import { Essence } from "../models/essence/essence";
export interface ViewDefinitionConverter<VD extends object, E extends Essence> {
    version: number;
    fromViewDefinition(definition: VD, dataCube: DataCube): E;
    toViewDefinition(essence: E): VD;
}
