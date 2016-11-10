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

import { List } from 'immutable';
import { Class, Instance, isInstanceOf, immutableArraysEqual } from 'immutable-class';
import { $, Expression } from 'plywood';
import { Dimension } from '../dimension/dimension';
import { Filter, FilterJS } from '../filter/filter';

export interface HighlightValue {
  owner: string;
  delta: Filter;
  measure?: string;
}

export interface HighlightJS {
  owner: string;
  delta: FilterJS;
  measure?: string;
}

var check: Class<HighlightValue, HighlightJS>;
export class Highlight implements Instance<HighlightValue, HighlightJS> {

  static isHighlight(candidate: any): candidate is Highlight {
    return isInstanceOf(candidate, Highlight);
  }

  static fromJS(parameters: HighlightJS): Highlight {
    return new Highlight({
      owner: parameters.owner,
      delta: Filter.fromJS(parameters.delta),
      measure: parameters.measure
    });
  }


  public owner: string;
  public delta: Filter;
  public measure: string;

  constructor(parameters: HighlightValue) {
    var owner = parameters.owner;
    if (typeof owner !== 'string') throw new TypeError('owner must be a string');
    this.owner = owner;
    this.delta = parameters.delta;
    this.measure = parameters.measure || null;
  }

  public valueOf(): HighlightValue {
    return {
      owner: this.owner,
      delta: this.delta,
      measure: this.measure
    };
  }

  public toJS(): HighlightJS {
    var js: HighlightJS = {
      owner: this.owner,
      delta: this.delta.toJS()
    };
    if (this.measure) js.measure = this.measure;
    return js;
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
      this.delta.equals(other.delta) &&
      this.measure === other.measure;
  }

  public applyToFilter(filter: Filter): Filter {
    return filter.applyDelta(this.delta);
  }

  public constrainToDimensions(dimensions: List<Dimension>, timeAttribute: Expression): Highlight {
    var { delta } = this;
    var newDelta = delta.constrainToDimensions(dimensions, timeAttribute);
    if (newDelta === delta) return this;
    if (newDelta.length() === 0) return null;

    var value = this.valueOf();
    value.delta = newDelta;
    return new Highlight(value);
  }
}
check = Highlight;
