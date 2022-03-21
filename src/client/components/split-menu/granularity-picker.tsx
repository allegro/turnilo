/*
 * Copyright 2017-2019 Allegro.pl
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

import React from "react";
import { Dimension, isContinuous } from "../../../common/models/dimension/dimension";
import { ContinuousDimensionKind, formatGranularity, getGranularities, granularityToString, validateGranularity } from "../../../common/models/granularity/granularity";
import { Bucket } from "../../../common/models/split/split";
import { Unary } from "../../../common/utils/functional/functional";
import { STRINGS } from "../../config/constants";
import { StringInputWithPresets } from "../input-with-presets/string-input-with-presets";

export interface GranularityPickerProps {
  dimension: Dimension;
  granularity: string;
  granularityChange: Unary<string, void>;
}

export const GranularityPicker: React.FunctionComponent<GranularityPickerProps> = ({ dimension, granularity, granularityChange }) => {
  if (!isContinuous(dimension)) return null;

  const granularities = dimension.granularities || getGranularities(dimension.kind as ContinuousDimensionKind, dimension.bucketedBy);
  const presets = granularities.map((g: Bucket) => {
    return {
      name: formatGranularity(g),
      identity: granularityToString(g)
    };
  });

  const placeholder = dimension.kind === "time" ? STRINGS.floorableDurationsExamples : "Bucket size";

  return <StringInputWithPresets
    title={STRINGS.granularity}
    selected={granularity}
    errorMessage={validateGranularity(dimension.kind, granularity)}
    onChange={granularityChange}
    placeholder={placeholder}
    presets={presets} />;
};
