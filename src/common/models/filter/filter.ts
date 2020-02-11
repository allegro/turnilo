/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import { Timezone } from "chronoshift";
import { List, Record } from "immutable";
import { Expression } from "plywood";
import { Unary } from "../../utils/functional/functional";
import { DataCube } from "../data-cube/data-cube";
import { Dimension } from "../dimension/dimension";
import { Dimensions } from "../dimension/dimensions";
import { FilterClause, FilterDefinition, fromJS, RelativeTimeFilterClause, StringFilterAction, StringFilterClause, toExpression } from "../filter-clause/filter-clause";

export enum FilterMode { EXCLUDE = "exclude", INCLUDE = "include", REGEX = "regex", CONTAINS = "contains" }

export interface FilterValue {
  clauses: List<FilterClause>;
}

const defaultFilter: FilterValue = { clauses: List([]) };

export class Filter extends Record<FilterValue>(defaultFilter) {

  static fromClause(clause: FilterClause): Filter {
    return this.fromClauses([clause]);
  }

  static fromClauses(clauses: FilterClause[]): Filter {
    if (!clauses) throw new Error("must have clause");
    return new Filter({ clauses: List(clauses) });
  }

  static fromJS(definition: { clauses: FilterDefinition[] }): Filter {
    return new Filter({
      clauses: List(definition.clauses.map(def => fromJS(def)))
    });
  }

  private updateClauses(updater: Unary<List<FilterClause>, List<FilterClause>>): Filter {
    return this.update("clauses", updater);
  }

  public toString() {
    return this.clauses.map(clause => clause.toString()).join(" and ");
  }

  public replaceByIndex(index: number, newClause: FilterClause): Filter {
    if (this.length() === index) {
      return this.insertByIndex(index, newClause);
    }
    return this.updateClauses((clauses: List<FilterClause>) => {
      const newClauseIndex = clauses.findIndex(clause => clause.equals(newClause));
      if (newClauseIndex === -1) return clauses.set(index, newClause);
      const oldClause = clauses.get(index);
      return clauses
        .set(index, newClause)
        .set(newClauseIndex, oldClause);
    });
  }

  public insertByIndex(index: number, newClause: FilterClause): Filter {
    return this.updateClauses((clauses: List<FilterClause>) =>
      clauses
        .insert(index, newClause)
        .filterNot((c, i) => c.equals(newClause) && i !== index));
  }

  public empty(): boolean {
    return this.clauses.count() === 0;
  }

  public single(): boolean {
    return this.clauses.count() === 1;
  }

  public length(): number {
    return this.clauses.count();
  }

  public toExpression(dataCube: DataCube): Expression {
    const clauses = this.clauses.toArray().map(clause => toExpression(clause, dataCube.getDimension(clause.reference)));
    switch (clauses.length) {
      case 0:
        return Expression.TRUE;
      case 1:
        return clauses[0];
      default:
        return Expression.and(clauses);
    }
  }

  public isRelative(): boolean {
    return this.clauses.some(clause => clause instanceof RelativeTimeFilterClause);
  }

  public getSpecificFilter(now: Date, maxTime: Date, timezone: Timezone): Filter {
    if (!this.isRelative()) return this;
    return this.updateClauses(clauses =>
      clauses.map(clause => {
        if (clause instanceof RelativeTimeFilterClause) {
          return clause.evaluate(now, maxTime, timezone);
        }
        return clause;
      }));
  }

  private indexOfClause(reference: string): number {
    return this.clauses.findIndex(clause => clause.reference === reference);
  }

  public clauseForReference(reference: string): FilterClause {
    return this.clauses.find(clause => clause.reference === reference);
  }

  public addClause(clause: FilterClause): Filter {
    return this.updateClauses(clauses => clauses.push(clause));
  }

  public removeClause(reference: string): Filter {
    const index = this.indexOfClause(reference);
    if (index === -1) return this;
    return this.updateClauses(clauses => clauses.delete(index));
  }

  public filteredOn(reference: string): boolean {
    return this.indexOfClause(reference) !== -1;
  }

  public getClauseForDimension({ name }: Dimension): FilterClause {
    return this.clauses.find(clause => clause.reference === name);
  }

  public getModeForDimension({ name }: Dimension): FilterMode {
    const dimensionClauses = this.clauses.filter(clause => clause.reference === name);

    if (dimensionClauses.size > 0) {
      if (dimensionClauses.every(clause =>
        clause instanceof StringFilterClause && clause.action === StringFilterAction.MATCH)) {
        return FilterMode.REGEX;
      }
      if (dimensionClauses.every(clause =>
        clause instanceof StringFilterClause && clause.action === StringFilterAction.CONTAINS)) {
        return FilterMode.CONTAINS;
      }
      if (dimensionClauses.every((clause: any) => clause.not)) {
        return FilterMode.EXCLUDE;
      }
      return FilterMode.INCLUDE;
    }

    return undefined;
  }

  public setClause(newClause: FilterClause): Filter {
    const idx = this.clauses.findIndex(clause => clause.reference === newClause.reference);
    return this.updateClauses(clauses => idx === -1 ? clauses.concat([newClause]) : clauses.set(idx, newClause));
  }

  public mergeClauses(clauses: List<FilterClause>): Filter {
    return clauses.reduce((filter, deltaClause) => filter.setClause(deltaClause), this);
  }

  public constrainToDimensions(dimensions: Dimensions): Filter {
    return this.updateClauses(clauses =>
      clauses.filter(clause => dimensions.getDimensionByName(clause.reference)));
  }

  public setExclusionForDimension(exclusion: boolean, { name }: Dimension): Filter {
    return this.updateClauses(clauses => {
      const idx = clauses.findIndex(clause => clause.reference === name);
      if (idx === -1) return clauses;
      return clauses.setIn([idx, "not"], exclusion);
    });
  }
}

export const EMPTY_FILTER = new Filter({});
