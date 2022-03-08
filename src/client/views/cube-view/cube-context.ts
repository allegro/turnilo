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

import React from "react";
import { Clicker } from "../../../common/models/clicker/clicker";
import { Essence } from "../../../common/models/essence/essence";

export interface CubeContextValue {
  essence: Essence;
  clicker: Clicker;
}

export const CubeContext = React.createContext<CubeContextValue>({
  get essence(): Essence {
    throw new Error("Attempted to consume CubeContext when there was no Provider in place.");
  },
  get clicker(): Clicker {
    throw new Error("Attempted to consume CubeContext when there was no Provider in place.");
  }
});
