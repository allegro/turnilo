import { Expression } from "plywood";
import { DataCube } from "../../models/data-cube/data-cube";
import { Essence } from "../../models/essence/essence";
import { Split } from "../../models/split/split";
import { ViewDefinitionConverter } from "../view-definition-converter";
import { ViewDefinition2 } from "./view-definition-2";
export declare type FilterSelection = Expression | string;
export declare class ViewDefinitionConverter2 implements ViewDefinitionConverter<ViewDefinition2, Essence> {
    version: number;
    fromViewDefinition(definition: ViewDefinition2, dataCube: DataCube): Essence;
    toViewDefinition(essence: Essence): ViewDefinition2;
}
export default function splitJSConverter(splits: any[], dataCube: DataCube): Split[];
