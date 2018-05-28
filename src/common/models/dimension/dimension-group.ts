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

import { immutableArraysEqual, Instance } from "immutable-class";
import { makeTitle } from "../../utils/general/general";
import { Dimension, DimensionJS } from "./dimension";

export type DimensionOrGroupJS = DimensionJS | DimensionGroupJS;
export type DimensionOrGroup = Dimension | DimensionGroup;

export interface DimensionGroupJS {
  name: string;
  title?: string;
  dimensions: DimensionOrGroupJS[];
}

export interface DimensionGroupValue {
  name: string;
  title?: string;
  dimensions: DimensionOrGroup[];
}

export interface DimensionOrGroupVisitor<R> {
  visitDimension(dimension: Dimension): R;

  visitDimensionGroup(dimensionGroup: DimensionGroup): R;
}

export function dimensionOrGroupFromJS(dimensionOrGroup: DimensionOrGroupJS): DimensionOrGroup {
  if (isDimensionGroupJS(dimensionOrGroup)) {
    return DimensionGroup.fromJS(dimensionOrGroup);
  } else {
    return Dimension.fromJS(dimensionOrGroup);
  }
}

function isDimensionGroupJS(dimensionOrGroup: DimensionOrGroupJS): dimensionOrGroup is DimensionGroupJS {
  return (dimensionOrGroup as DimensionGroupJS).dimensions !== undefined;
}

export class DimensionGroup implements Instance<DimensionGroupValue, DimensionGroupJS> {
  static fromJS(dimensionGroup: DimensionGroupJS) {
    const { name, title, dimensions } = dimensionGroup;

    if (name == null) {
      throw new Error(`dimension group requires a name`);
    }

    if (dimensions == null || dimensions.length === 0) {
      throw new Error(`dimension group '${name}' has no dimensions`);
    }

    return new DimensionGroup({
      name,
      title,
      dimensions: dimensions.map(dimensionOrGroupFromJS)
    });
  }

  static isDimensionGroup(candidate: any): candidate is DimensionGroup {
    return candidate instanceof DimensionGroup;
  }

  readonly name: string;
  readonly title: string;
  readonly type = "group";
  readonly dimensions: DimensionOrGroup[];

  constructor(parameters: DimensionGroupValue) {
    this.name = parameters.name;
    this.title = parameters.title || makeTitle(parameters.name);
    this.dimensions = parameters.dimensions;
  }

  accept<R>(visitor: DimensionOrGroupVisitor<R>): R {
    return visitor.visitDimensionGroup(this);
  }

  equals(other: any): boolean {
    return this === other
      || DimensionGroup.isDimensionGroup(other) && immutableArraysEqual(this.dimensions, other.dimensions);
  }

  toJS(): DimensionGroupJS {
    return {
      name: this.name,
      title: this.title,
      dimensions: this.dimensions.map(dimension => dimension.toJS())
    };
  }

  toJSON(): DimensionGroupJS {
    return this.toJS();
  }

  valueOf(): DimensionGroupValue {
    return {
      name: this.name,
      title: this.title,
      dimensions: this.dimensions
    };
  }
}
