import { Datum } from "plywood";
import { Dimension } from "../../../../common/models/dimension/dimension";
export default function filterByDimensionValue(data: Datum[], { name }: Dimension, searchText: string): Datum[];
