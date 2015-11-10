import Collection = Immutable.Collection;
import Color = d3.Color;
'use strict';

import { Class, Instance, isInstanceOf } from 'immutable-class';
import { $, Expression, Set, SetJS } from 'plywood';
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

export interface ColorsValue {
  dimension: string;
  values: Set;
  limit: number;
  sameAsLimit: boolean;
}

export interface ColorsJS {
  dimension: string;
  values?: SetJS;
  limit?: number;
}

var check: Class<ColorsValue, ColorsJS>;
export class Colors implements Instance<ColorsValue, ColorsJS> {

  static isColors(candidate: any): boolean {
    return isInstanceOf(candidate, Colors);
  }

  static fromJS(parameters: ColorsJS): Colors {
    var value: ColorsValue = {
      dimension: parameters.dimension,
      values: parameters.values ? Set.fromJS(parameters.values) : null,
      limit: parameters.limit
    };
    return new Colors(value);
  }


  public dimension: string;
  public values: Set;
  public limit: number;

  constructor(parameters: ColorsValue) {
    this.dimension = parameters.dimension;
    this.values = parameters.values;
    this.limit = parameters.limit;
  }

  public valueOf(): ColorsValue {
    return {
      dimension: this.dimension,
      values: this.values,
      limit: this.limit
    };
  }

  public toJS(): ColorsJS {
    var js: ColorsJS = {
      dimension: this.dimension
    };
    if (this.values) js.values = this.values;
    if (this.limit) js.limit = this.limit;
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
      Boolean(this.values) === Boolean(other.values) &&
      (!this.values || this.values.equals(other.values)) &&
      Boolean(this.limit) === Boolean(other.limit) &&
      (!this.limit || this.limit === other.limit);
  }

  public addToExpression(ex: Expression, segmentName: string): Expression {
    var { dimension, values, limit } = this;

    if (values) {
      ex = ex.filter($(segmentName).in(values));
    }

    if (limit) {
      ex = ex.limit(limit);
    }

    return ex;
  }

  public toggleValue(v: any): Colors {
    var value = this.valueOf();
    if (!value.values) value.values = Set.EMPTY;
    value.values = value.values.add(v);
    return new Colors(value);
  }

  public getColor(value: any, index: number): string {
    var { values, limit } = this;
    if (values) {
      var elements = values.elements;
      var colorIdx = elements.indexOf(value);
      return colorIdx === -1 ? null : COLORS[colorIdx];
    } else {
      if (limit && limit <= index) return null;
      return COLORS[index % COLORS.length];
    }
  }
}
check = Colors;
