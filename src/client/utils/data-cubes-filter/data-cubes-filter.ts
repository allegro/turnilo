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

import { DataCube } from "../../../common/models/data-cube/data-cube";
import { complement } from "../../../common/utils/functional/functional";
import { isNil } from "../../../common/utils/general/general";

const ESCAPE_REG_EXP = /[.*+?^${}()|[\]\\]/g;

function escapeRegExp(input: string): string {
  return input.replace(ESCAPE_REG_EXP, "\\$&");
}

interface RankedDataCube {
  dataCube: DataCube;
  rank: number;
}

function contentRank(description: string, query: string): number {
  const regExp = new RegExp(escapeRegExp(query), "gi");
  const descriptionMatches = description.match(regExp) || [];
  return descriptionMatches.length;
}

function titleRank(title: string, query: string): number {
  const lowerCaseQuery = query.toLowerCase();
  const lowerCaseTitle = title.toLowerCase();
  if (lowerCaseTitle.includes(lowerCaseQuery)) {
    return (Number.MAX_SAFE_INTEGER / 4) - lowerCaseTitle.indexOf(lowerCaseQuery);
  }
  return 0;
}

export default function filterDataCubes(dataCubes: DataCube[], query: string, searchInContent = true): DataCube[] {
  if (query.trim().length === 0) {
    return dataCubes;
  }
  return dataCubes
    .map((dataCube: DataCube) => {
      const { title, description } = dataCube;
      const rank = titleRank(title, query) + (searchInContent ? contentRank(description, query) : 0);
      return rank > 0 ? { dataCube, rank } : null;
    })
    .filter(complement(isNil))
    .sort(({ rank: a }: RankedDataCube, { rank: b }: RankedDataCube) => b - a)
    .map(({ dataCube }: RankedDataCube) => dataCube);
}
