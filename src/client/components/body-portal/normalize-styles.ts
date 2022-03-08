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
import { omitFalsyValues } from "../../../common/utils/object/object";

function normalizeDimension(dimension: number | string): string | undefined {
  if (typeof dimension === "number") {
    return Math.round(dimension) + "px";
  }
  if (typeof dimension === "string") {
    return dimension;
  }
  return undefined;
}

export interface StyleDefinition {
  left?: number | string;
  right?: number | string;
  top?: number | string;
  bottom?: number | string;
  disablePointerEvents?: boolean;
  isAboveAll?: boolean;
}

export default function normalizeStyles(source: StyleDefinition): React.CSSProperties {
  const { left, top, bottom, right, disablePointerEvents, isAboveAll } = source;
  const dimensions = {
    top: normalizeDimension(top),
    bottom: normalizeDimension(bottom),
    left: normalizeDimension(left),
    right: normalizeDimension(right)
  };
  return {
    ...omitFalsyValues(dimensions),
    zIndex: 200 + (isAboveAll ? 1 : 0),
    pointerEvents: disablePointerEvents ? "none" : "auto"
  };
}
