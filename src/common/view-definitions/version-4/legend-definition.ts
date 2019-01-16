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
import { Colors } from "../../models/colors/colors";
import { DataCube } from "../../models/data-cube/data-cube";

export interface LegendDefinition {
  dimension: string;
  limit?: number;
  values?: Record<string, any>;
  hasNull: boolean;
}

export interface LegendDefinitionConverter {
  toColors(legend: LegendDefinition, dataCube: DataCube): Colors;

  fromColors(colors: Colors): LegendDefinition;
}

export const legendConverter: LegendDefinitionConverter = {
  toColors(legend: LegendDefinition, dataCube: DataCube): Colors {
    const { dimension: dimensionName, values, limit, hasNull } = legend;
    const dimension = dataCube.getDimension(dimensionName);
    return new Colors({ dimension, limit, values, hasNull });
  },

  fromColors(colors: Colors): LegendDefinition {
    const { dimension, limit, values, hasNull } = colors;

    return {
      dimension: dimension.name,
      limit,
      values,
      hasNull
    };
  }
};
