import { DataCube } from "../../models/data-cube/data-cube";
import { Resolution } from "../../models/visualization-manifest/visualization-manifest";
export declare class Resolutions {
    static someDimensions: (dataCube: DataCube) => Resolution[];
    static defaultSelectedMeasures: (dataCube: DataCube) => Resolution[];
    static firstMeasure: (dataCube: DataCube) => Resolution[];
}
