/*
 * Copyright 2017-2018 Allegro.pl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Dimension } from "../../../../common/models/dimension/dimension";
import { Essence } from "../../../../common/models/essence/essence";
import { Split } from "../../../../common/models/split/split";

function dimensionForSplit(essence: Essence, split: Split): Dimension {
   return essence.dataCube.getDimension(split.reference);
}

export function getContinuousSplit({ splits: { splits } }: Essence): Split {
   return splits.last();
}

export function getContinuousDimension(essence: Essence): Dimension {
   const split = getContinuousSplit(essence);
   return dimensionForSplit(essence, split);
}

export function getContinuousReference(essence: Essence): string {
   return getContinuousSplit(essence).reference;
}

export function getNominalSplit({ splits: { splits } }: Essence): Split | null {
   return splits.count() === 1 ? null : splits.first();
}

export function hasNominalSplit(essence: Essence): boolean {
   return getNominalSplit(essence) !== null;
}

export function getNominalDimension(essence: Essence): Dimension | null {
   const split = getNominalSplit(essence);
   return split && dimensionForSplit(essence, split);
}
