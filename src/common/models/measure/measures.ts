/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import { List, OrderedSet } from "immutable";
import { immutableArraysEqual } from "immutable-class";
import { Expression } from "plywood";
import { complement } from "../../utils/functional/functional";
import { isNil, quoteNames } from "../../utils/general/general";
import { Measure, MeasureDerivation } from "./measure";
import { isMeasureGroupJS, MeasureGroup, MeasureOrGroup, measureOrGroupFromJS, MeasureOrGroupJS, MeasureOrGroupVisitor } from "./measure-group";

class FlattenMeasuresWithGroupsVisitor implements MeasureOrGroupVisitor<void> {
  private items = List<MeasureOrGroup>().asMutable();

  visitMeasure(measure: Measure): void {
    this.items.push(measure);
  }

  visitMeasureGroup(measureGroup: MeasureGroup): void {
    this.items.push(measureGroup);
    measureGroup.measures.forEach(measureOrGroup => measureOrGroup.accept(this));
  }

  getMeasuresAndGroups(): List<MeasureOrGroup> {
    return this.items.toList();
  }
}

function findDuplicateNames(items: List<MeasureOrGroup>): List<string> {
  return items
    .groupBy(measure => measure.name)
    .filter(names => names.size > 1)
    .map((names, name) => name)
    .toList();
}

function measureNamesWithForbiddenPrefix(items: List<MeasureOrGroup>): List<{ name: string, prefix: string }> {
  return items
    .map(measureOrGroup => {
      if (isMeasureGroupJS(measureOrGroup)) {
        return null;
      }
      if (measureOrGroup.name.startsWith(MeasureDerivation.PREVIOUS)) {
        return { name: measureOrGroup.name, prefix: MeasureDerivation.PREVIOUS };
      }
      if (measureOrGroup.name.startsWith(MeasureDerivation.DELTA)) {
        return { name: measureOrGroup.name, prefix: MeasureDerivation.DELTA };
      }
      return null;
    })
    .filter(complement(isNil))
    .toList();
}

function filterMeasures(items: List<MeasureOrGroup>): List<Measure> {
  return List<Measure>(items
    .filter(item => item.type === "measure")
    .toList());
}

export class Measures {
  static empty(): Measures {
    return new Measures([]);
  }

  static fromJS(parameters: MeasureOrGroupJS[]): Measures {
    return new Measures(parameters.map(measureOrGroupFromJS));
  }

  private readonly measures: MeasureOrGroup[];
  private readonly flattenedMeasures: List<Measure>;

  private constructor(measures: MeasureOrGroup[]) {
    this.measures = [...measures];

    const duplicateNamesFindingVisitor = new FlattenMeasuresWithGroupsVisitor();
    this.measures.forEach(measureOrGroup => measureOrGroup.accept(duplicateNamesFindingVisitor));
    const flattenedMeasuresWithGroups = duplicateNamesFindingVisitor.getMeasuresAndGroups();

    const duplicateNames = findDuplicateNames(flattenedMeasuresWithGroups);
    if (duplicateNames.size > 0) {
      throw new Error(`found duplicate measure or group with names: ${quoteNames(duplicateNames)}`);
    }

    const invalidNames = measureNamesWithForbiddenPrefix(flattenedMeasuresWithGroups);
    if (invalidNames.size > 0) {
      throw new Error(`found measure that starts with forbidden prefixes: ${invalidNames.map(({ name, prefix }) => `'${name}' (prefix: '${prefix}')`).toArray().join(", ")}`);
    }
    this.flattenedMeasures = filterMeasures(flattenedMeasuresWithGroups);
  }

  accept<R>(visitor: MeasureOrGroupVisitor<R>): R[] {
    return this.measures.map(measureOrGroup => measureOrGroup.accept(visitor));
  }

  size(): int {
    return this.flattenedMeasures.size;
  }

  first(): Measure {
    return this.flattenedMeasures.first();
  }

  equals(other: Measures): boolean {
    return this === other || immutableArraysEqual(this.measures, other.measures);
  }

  mapMeasures<R>(mapper: (measure: Measure) => R): R[] {
    return this.flattenedMeasures.map(mapper).toArray();
  }

  filterMeasures(predicate: (dimension: Measure) => boolean): Measure[] {
    return this.flattenedMeasures.filter(predicate).toArray();
  }

  forEachMeasure(sideEffect: (measure: Measure) => void): void {
    this.flattenedMeasures.forEach(sideEffect);
  }

  getMeasureByName(measureName: string): Measure {
    return this.flattenedMeasures.find(measure => measure.name === measureName);
  }

  getMeasureByExpression(expression: Expression): Measure {
    return this.flattenedMeasures.find(measure => measure.expression.equals(expression));
  }

  getMeasureNames(): List<string> {
    return this.flattenedMeasures.map(measure => measure.name).toList();
  }

  containsMeasureWithName(name: string): boolean {
    return this.flattenedMeasures.some(measure => measure.name === name);
  }

  getFirstNMeasureNames(n: number): OrderedSet<string> {
    return OrderedSet(this.flattenedMeasures.slice(0, n).map(measure => measure.name));
  }

  append(...measures: Measure[]): Measures {
    return new Measures([...this.measures, ...measures]);
  }

  prepend(...measures: Measure[]): Measures {
    return new Measures([...measures, ...this.measures]);
  }

  toJS(): MeasureOrGroupJS[] {
    return this.measures.map(measure => measure.toJS());
  }
}
