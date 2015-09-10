'use strict';

import { Class, Instance, isInstanceOf, arraysEqual } from 'immutable-class';
import { $, Expression } from 'plywood';
import { DataSource } from '../data-source/data-source';
import { Filter, FilterJS } from '../filter/filter';

export interface HighlightValue {
  owner: string;
  delta: Filter;
}

export interface HighlightJS {
  owner: string;
  delta: FilterJS;
}

var check: Class<HighlightValue, HighlightJS>;
export class Highlight implements Instance<HighlightValue, HighlightJS> {

  static isHighlight(candidate: any): boolean {
    return isInstanceOf(candidate, Highlight);
  }

  static fromJS(parameters: HighlightJS): Highlight {
    return new Highlight({
      owner: parameters.owner,
      delta: Filter.fromJS(parameters.delta)
    });
  }


  public owner: string;
  public delta: Filter;

  constructor(parameters: HighlightValue) {
    var owner = parameters.owner;
    if (typeof owner !== 'string') throw new TypeError('owner must be a string');
    this.owner = owner;
    this.delta = parameters.delta;
  }

  public valueOf(): HighlightValue {
    return {
      owner: this.owner,
      delta: this.delta
    };
  }

  public toJS(): HighlightJS {
    return {
      owner: this.owner,
      delta: this.delta.toJS()
    };
  }

  public toJSON(): HighlightJS {
    return this.toJS();
  }

  public toString(): string {
    return `[Highlight ${this.owner}]`;
  }

  public equals(other: Highlight): boolean {
    return Highlight.isHighlight(other) &&
      this.owner === other.owner &&
      this.delta.equals(other.delta);
  }

  public applyToFilter(filter: Filter): Filter {
    return filter.applyDelta(this.delta);
  }

  public constrainToDataSource(dataSource: DataSource): Highlight {
    var { delta } = this;
    var newDelta = delta.constrainToDataSource(dataSource);
    if (newDelta === delta) return this;
    if (newDelta.length() === 0) return null;

    var value = this.valueOf();
    value.delta = newDelta;
    return new Highlight(value);
  }
}
check = Highlight;
