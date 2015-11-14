'use strict';

import { Class, Instance, isInstanceOf, isImmutableClass } from 'immutable-class';
import { $, Expression, Set, valueFromJS, valueToJS } from 'plywood';
import { hasOwnProperty } from '../../../common/utils/general/general';
import { DataSource } from '../data-source/data-source';

const COLORS = [
  '#1f77b4',
  '#ff7f0e',
  '#2ca02c',
  '#d62728',
  '#9467bd',
  '#8c564b',
  '#e377c2',
  '#7f7f7f',
  '#bcbd22',
  '#17becf'
];

function valuesFromJS(valuesJS: Lookup<any>): Lookup<any> {
  var values: Lookup<any> = {};
  for (var i = 0; i < COLORS.length; i++) {
    if (!hasOwnProperty(valuesJS, i)) continue;
    values[i] = valueFromJS(valuesJS[i]);
  }
  return values;
}

function valuesToJS(values: Lookup<any>): Lookup<any> {
  var valuesJS: Lookup<any> = {};
  for (var i = 0; i < COLORS.length; i++) {
    if (!hasOwnProperty(values, i)) continue;
    valuesJS[i] = valueToJS(values[i]);
  }
  return valuesJS;
}

function valueEquals(v1: any, v2: any): boolean {
  if (v1 === v2) return true;
  if (v1.toISOString) return v1.valueOf() === v2.valueOf();
  if (isImmutableClass(v1)) return v1.equals(v2);
  return false;
}

function valuesEqual(values1: Lookup<any>, values2: Lookup<any>): boolean {
  if (values1 === values2) return true;
  if (!values1 !== !values2) return false;
  for (var i = 0; i < COLORS.length; i++) {
    var v1 = values1[i];
    var v2 = values2[i];
    if (v1 === v2) continue;
    if (!v1 !== !v2) return false;
    if (!valueEquals(v1, v2)) return false;
  }
  return true;
}

function cloneValues(values: Lookup<any>): Lookup<any> {
  var newValues: Lookup<any> = {};
  for (var i = 0; i < COLORS.length; i++) {
    if (!hasOwnProperty(values, i)) continue;
    newValues[i] = values[i];
  }
  return newValues;
}

export interface ColorsValue {
  dimension: string;
  values: Lookup<any>;
  limit?: number;
  sameAsLimit?: boolean;
}

export interface ColorsJS {
  dimension: string;
  values?: Lookup<any>;
  limit?: number;
  sameAsLimit?: boolean;
}

var check: Class<ColorsValue, ColorsJS>;
export class Colors implements Instance<ColorsValue, ColorsJS> {

  static isColors(candidate: any): boolean {
    return isInstanceOf(candidate, Colors);
  }

  static init(dimension: string, limit: number): Colors {
    return Colors.fromJS({ dimension, limit });
  }

  static fromJS(parameters: ColorsJS): Colors {
    var value: ColorsValue = {
      dimension: parameters.dimension,
      values: parameters.values ? valuesFromJS(parameters.values) : null,
      limit: parameters.limit,
      sameAsLimit: parameters.sameAsLimit
    };
    return new Colors(value);
  }


  public dimension: string;
  public values: Lookup<any>;
  public limit: number;
  public sameAsLimit: boolean;

  constructor(parameters: ColorsValue) {
    this.dimension = parameters.dimension;
    if (!this.dimension) throw new Error('must have a dimension');
    this.values = parameters.values;
    this.limit = parameters.limit;
    this.sameAsLimit = parameters.sameAsLimit;
  }

  public valueOf(): ColorsValue {
    return {
      dimension: this.dimension,
      values: this.values,
      limit: this.limit,
      sameAsLimit: this.sameAsLimit
    };
  }

  public toJS(): ColorsJS {
    var js: ColorsJS = {
      dimension: this.dimension
    };
    if (this.values) js.values = valuesToJS(this.values);
    if (this.limit) js.limit = this.limit;
    if (this.sameAsLimit) js.sameAsLimit = true;
    return js;
  }

  public toJSON(): ColorsJS {
    return this.toJS();
  }

  public toString(): string {
    return `[Colors: ${this.dimension}]`;
  }

  public equals(other: Colors): boolean {
    return Colors.isColors(other) &&
      valuesEqual(this.values, other.values) &&
      Boolean(this.limit) === Boolean(other.limit) &&
      (!this.limit || this.limit === other.limit) &&
      this.sameAsLimit === other.sameAsLimit;
  }

  public equivalent(other: Colors): boolean {
    if (this.equals(other)) return true;
    if (!Colors.isColors(other)) return false;
    if (this.values && this.sameAsLimit && other.limit) {
      return true;
    }
    if (other.values && other.sameAsLimit && this.limit) {
      return true;
    }
    return false;
  }

  public numColors(): number {
    var { values, limit } = this;
    if (values) {
      return Object.keys(values).length;
    }
    return limit;
  }

  public valuesToArray(): any[] {
    var { values } = this;
    if (!values) return null;

    var vs: any[] = [];
    for (var i = 0; i < COLORS.length; i++) {
      if (!hasOwnProperty(values, i)) continue;
      vs.push(values[i]);
    }

    return vs;
  }

  public addToExpression(ex: Expression, segmentName: string): Expression {
    var { values } = this;

    if (values) {
      ex = ex.filter($(segmentName).in(Set.fromJS(this.valuesToArray())));
    }

    return ex.limit(this.numColors());
  }

  public setValueEquivalent(v: any[]): Colors {
    var values: Lookup<any> = {};
    var n = Math.min(v.length, COLORS.length);
    for (var i = 0; i < n; i++) {
      values[i] = v[i];
    }
    return new Colors({
      dimension: this.dimension,
      values,
      sameAsLimit: true
    });
  }

  public toggleValue(v: any): Colors {
    return this.hasValue(v) ? this.addValue(v) : this.removeValue(v);
  }

  public valueIndex(v: any): number {
    var { values } = this;
    if (!values) return -1;
    for (var i = 0; i < COLORS.length; i++) {
      if (!hasOwnProperty(values, i)) continue;
      if (valueEquals(values[i], v)) return i;
    }
    return -1;
  }

  public nextIndex(): number {
    var { values } = this;
    if (!values) return 0;
    for (var i = 0; i < COLORS.length; i++) {
      if (hasOwnProperty(values, i)) continue;
      return i;
    }
    return -1;
  }

  public hasValue(v: any): boolean {
    return this.valueIndex(v) !== -1;
  }

  public addValue(v: any): Colors {
    if (this.hasValue(v)) return this;
    var idx = this.nextIndex();
    if (idx === -1) return this;

    var value = this.valueOf();
    value.values = value.values ? cloneValues(value.values) : {};
    value.values[idx] = v;
    delete value.sameAsLimit;
    return new Colors(value);
  }

  public removeValue(v: any): Colors {
    var idx = this.valueIndex(v);
    if (idx === -1) return this;

    var value = this.valueOf();
    value.values = cloneValues(value.values);
    delete value.values[idx];
    delete value.sameAsLimit;
    return new Colors(value);
  }

  public getColor(value: any, index: number): string {
    var { values, limit } = this;
    if (values) {
      var colorIdx = this.valueIndex(value);
      return colorIdx === -1 ? null : COLORS[colorIdx];
    } else {
      if (limit && limit <= index) return null;
      return COLORS[index % COLORS.length];
    }
  }
}
check = Colors;
