import { Dimension } from "../../../../common/models/dimension/dimension";
import { Essence } from "../../../../common/models/essence/essence";
import { Split } from "../../../../common/models/split/split";
export declare function getContinuousSplit({ splits: { splits } }: Essence): Split;
export declare function getContinuousDimension(essence: Essence): Dimension;
export declare function getContinuousReference(essence: Essence): string;
export declare function getNominalSplit({ splits: { splits } }: Essence): Split | null;
export declare function hasNominalSplit(essence: Essence): boolean;
export declare function getNominalDimension(essence: Essence): Dimension | null;
