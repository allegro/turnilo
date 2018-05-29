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

import { List } from "immutable";
import { immutableArraysEqual } from "immutable-class";
import { Expression } from "plywood";
import { quoteNames } from "../../utils/general/general";
import { Dimension } from "./dimension";
import { DimensionGroup, DimensionOrGroup, dimensionOrGroupFromJS, DimensionOrGroupJS, DimensionOrGroupVisitor } from "./dimension-group";

class FlattenDimensionsWithGroupsVisitor implements DimensionOrGroupVisitor<void> {
  private items = List<DimensionOrGroup>().asMutable();

  visitDimension(dimension: Dimension): void {
    this.items.push(dimension);
  }

  visitDimensionGroup(dimensionGroup: DimensionGroup): void {
    this.items.push(dimensionGroup);
    dimensionGroup.dimensions.forEach(dimensionOrGroup => dimensionOrGroup.accept(this));
  }

  getDimensionsWithGroups(): List<DimensionOrGroup> {
    return this.items.toList();
  }
}

function findDuplicateNames(items: List<DimensionOrGroup>): List<string> {
  return items
    .groupBy(dimension => dimension.name)
    .filter(names => names.size > 1)
    .map((names, name) => name)
    .toList();
}

function filterDimensions(items: List<DimensionOrGroup>): List<Dimension> {
  return List<Dimension>(items
    .filter(item => item.type === "dimension")
    .toList()
  );
}

export class Dimensions {
  static empty(): Dimensions {
    return new Dimensions([]);
  }

  static fromJS(parameters: DimensionOrGroupJS[]): Dimensions {
    return new Dimensions(parameters.map(dimensionOrGroupFromJS));
  }

  private readonly dimensions: DimensionOrGroup[];
  private readonly flattenedDimensions: List<Dimension>;

  private constructor(dimensions: DimensionOrGroup[]) {
    this.dimensions = [...dimensions];

    const flattenDimensionsWithGroupsVisitor = new FlattenDimensionsWithGroupsVisitor();
    this.dimensions.forEach(dimensionOrGroup => dimensionOrGroup.accept(flattenDimensionsWithGroupsVisitor));
    const flattenedDimensionsWithGroups = flattenDimensionsWithGroupsVisitor.getDimensionsWithGroups();
    const duplicateNames = findDuplicateNames(flattenedDimensionsWithGroups);

    if (duplicateNames.size > 0) {
      throw new Error(`found duplicate dimension or group with names: ${quoteNames(duplicateNames)}`);
    }

    this.flattenedDimensions = filterDimensions(flattenedDimensionsWithGroups);
  }

  accept<R>(visitor: DimensionOrGroupVisitor<R>): R[] {
    return this.dimensions.map(dimensionOrGroup => dimensionOrGroup.accept(visitor));
  }

  size(): number {
    return this.flattenedDimensions.size;
  }

  first(): Dimension {
    return this.flattenedDimensions.first();
  }

  equals(other: Dimensions): boolean {
    return this === other || immutableArraysEqual(this.dimensions, other.dimensions);
  }

  mapDimensions<R>(mapper: (dimension: Dimension) => R): R[] {
    return this.flattenedDimensions.map(mapper).toArray();
  }

  filterDimensions(predicate: (dimension: Dimension) => boolean): Dimension[] {
    return this.flattenedDimensions.filter(predicate).toArray();
  }

  forEachDimension(sideEffect: (dimension: Dimension) => void): void {
    this.flattenedDimensions.forEach(sideEffect);
  }

  getDimensionByName(name: string): Dimension {
    return this.flattenedDimensions.find(dimension => dimension.name === name);
  }

  getDimensionByExpression(expression: Expression): Dimension {
    return this.flattenedDimensions.find(dimension => expression.equals(dimension.expression));
  }

  getDimensionNames(): List<string> {
    return this.flattenedDimensions.map(dimension => dimension.name).toList();
  }

  containsDimensionWithName(name: string) {
    return this.flattenedDimensions.some(dimension => dimension.name === name);
  }

  append(...dimensions: Dimension[]) {
    return new Dimensions([...this.dimensions, ...dimensions]);
  }

  prepend(...dimensions: Dimension[]) {
    return new Dimensions([...dimensions, ...this.dimensions]);
  }

  toJS(): DimensionOrGroupJS[] {
    return this.dimensions.map(dimensionOrGroup => dimensionOrGroup.toJS());
  }
}
