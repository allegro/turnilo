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

import * as React from "react";
import { Essence } from "../../../../../common/models/essence/essence";
import { Corner } from "../../utils/corner";

interface CombinedSplitsTitle {
  essence: Essence;
}

export const CombinedSplitsTitle: React.SFC<CombinedSplitsTitle> = ({ essence }) => {
  const { splits, dataCube } = essence;
  const title = splits.splits.map(split => dataCube.getDimension(split.reference).title).join(", ");
  return <Corner>{title}</Corner>;
};
