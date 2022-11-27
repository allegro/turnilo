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

import { Expression } from "plywood";
import { values } from "../../utils/functional/functional";
import { isTruthy, makeTitle } from "../../utils/general/general";
import { mapValues } from "../../utils/object/object";
import {
  Dimension,
  DimensionJS,
  fromConfig as dimensionFromConfig,
  serialize as serializeDimension,
  SerializedDimension
} from "./dimension";

export type DimensionOrGroupJS = DimensionJS | DimensionGroupJS;

export interface DimensionGroupJS {
  name: string;
  title?: string;
  description?: string;
  dimensions: DimensionOrGroupJS[];
}

function isDimensionGroupJS(dimensionOrGroup: DimensionOrGroupJS): dimensionOrGroup is DimensionGroupJS {
  return (dimensionOrGroup as DimensionGroupJS).dimensions !== undefined;
}

export interface DimensionsGroup {
  name: string;
  title: string;
  description?: string;
  dimensions: DimensionOrGroup[];
}

type DimensionId = string;

export function isDimensionId(o: DimensionOrGroup): o is DimensionId {
  return typeof o === "string";
}

export type DimensionOrGroup = DimensionId | DimensionsGroup;

export interface Dimensions {
  tree: DimensionOrGroup[];
  byName: Record<DimensionId, Dimension>;
}

export function fromConfig(config: DimensionOrGroupJS[]): Dimensions {
  const byName: Record<DimensionId, Dimension> = {};

  function readDimensionOrGroup(dimOrGroup: DimensionOrGroupJS): DimensionOrGroup {
    if (isDimensionGroupJS(dimOrGroup)) {
      const { name, title, description, dimensions } = dimOrGroup;
      if (name == null) {
        throw new Error("dimension group requires a name");
      }

      if (!Array.isArray(dimensions) || dimensions.length === 0) {
        throw new Error(`dimension group '${name}' has no dimensions`);
      }
      return {
        name,
        title: title || makeTitle(name),
        description,
        dimensions: dimensions.map(readDimensionOrGroup)
      };
    } else {
      const dimension = dimensionFromConfig(dimOrGroup);
      const { name } = dimension;
      if (isTruthy(byName[name])) {
        throw new Error(`found duplicate dimension with name: '${name}'`);
      }
      byName[name] = dimension;
      return name;
    }
  }

  const tree = config.map(readDimensionOrGroup);

  return {
    tree,
    byName
  };
}

export interface SerializedDimensions {
  tree: DimensionOrGroup[];
  byName: Record<DimensionId, SerializedDimension>;
}

export function serialize({ tree, byName }: Dimensions): SerializedDimensions {
  return {
    tree,
    byName: mapValues(byName, serializeDimension)
  };
}

export type ClientDimensions = Dimensions;

export function allDimensions(dimensions: Dimensions): Dimension[] {
  return values(dimensions.byName);
}

export function findDimensionByName(dimensions: Dimensions, name: string): Dimension | null {
  return dimensions.byName[name] || null;
}

export function findDimensionByExpression(dimensions: Dimensions, expression: Expression): Dimension | null {
  return values(dimensions.byName).find(dimension => dimension.expression.equals(expression)) || null;
}

export function append(dimension: Dimension, dimensions: Dimensions): Dimensions {
  const { name } = dimension;
  return {
    byName: {
      ...dimensions.byName,
      [name]: dimension
    },
    tree: [...dimensions.tree, name]
  };
}

export function prepend(dimension: Dimension, dimensions: Dimensions): Dimensions {
  const { name } = dimension;
  return {
    byName: {
      ...dimensions.byName,
      [name]: dimension
    },
    tree: [name, ...dimensions.tree]
  };
}
