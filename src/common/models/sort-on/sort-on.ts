/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import { Class, Instance, isInstanceOf } from 'immutable-class';
import { $, Expression, RefExpression, SortAction } from 'plywood';
import { Dimension, DimensionJS } from '../dimension/dimension';
import { Measure, MeasureJS } from '../measure/measure';
import { DataSource } from '../data-source/data-source';

export interface SortOnValue {
  dimension?: Dimension;
  measure?: Measure;
}

export interface SortOnJS {
  dimension?: DimensionJS;
  measure?: MeasureJS;
}

var check: Class<SortOnValue, SortOnJS>;
export class SortOn implements Instance<SortOnValue, SortOnJS> {

  static isSortOn(candidate: any): candidate is SortOn {
    return isInstanceOf(candidate, SortOn);
  }

  static equal(s1: SortOn, s2: SortOn): boolean {
    return s1 === s2 || s1.equals(s2);
  }

  static getName(s: SortOn): string {
    return s.toName();
  }

  static getTitle(s: SortOn): string {
    return s.getTitle();
  }

  static fromDimension(dimension: Dimension): SortOn {
    return new SortOn({ dimension });
  }

  static fromMeasure(measure: Measure): SortOn {
    return new SortOn({ measure });
  }

  static fromSortAction(sortAction: SortAction, dataSource: DataSource, fallbackDimension: Dimension): SortOn {
    if (!sortAction) return SortOn.fromDimension(fallbackDimension);
    var sortOnName = (sortAction.expression as RefExpression).name;
    var measure = dataSource.getMeasure(sortOnName);
    if (measure) return SortOn.fromMeasure(measure);
    return SortOn.fromDimension(fallbackDimension);
  }

  static fromJS(parameters: SortOnJS): SortOn {
    var value: SortOnValue = {};
    if (parameters.dimension) {
      value.dimension = Dimension.fromJS(parameters.dimension);
    } else {
      value.measure = Measure.fromJS(parameters.measure);
    }
    return new SortOn(value);
  }

  public dimension: Dimension;
  public measure: Measure;

  constructor(parameters: SortOnValue) {
    this.dimension = parameters.dimension;
    this.measure = parameters.measure;
  }

  public valueOf(): SortOnValue {
    return {
      dimension: this.dimension,
      measure: this.measure
    };
  }

  public toJS(): SortOnJS {
    var js: SortOnJS = {};
    if (this.dimension) {
      js.dimension = this.dimension.toJS();
    } else {
      js.measure = this.measure.toJS();
    }
    return js;
  }

  public toJSON(): SortOnJS {
    return this.toJS();
  }

  public toString(): string {
    return `[SortOn: ${this.toName()}]`;
  }

  public equals(other: SortOn): boolean {
    return SortOn.isSortOn(other) &&
      (this.dimension ? this.dimension.equals(other.dimension) : this.measure.equals(other.measure));
  }

  public toName(): string {
    var { measure } = this;
    return measure ? measure.name : this.dimension.name;
  }

  public getTitle(): string {
    var { measure } = this;
    return measure ? measure.title : this.dimension.title;
  }

  public getExpression(): Expression {
    return $(this.toName());
  }
}
check = SortOn;
