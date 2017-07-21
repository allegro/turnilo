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
import { $, Expression } from 'swiv-plywood';
import { verifyUrlSafeName, makeTitle } from '../../utils/general/general';
import { Granularity, GranularityJS, granularityFromJS, granularityToJS, granularityEquals } from "../granularity/granularity";

var geoName = /continent|country|city|region/i;
function isGeo(name: string): boolean {
  return geoName.test(name);
}

function typeToKind(type: string): string {
  if (!type) return type;
  return type.toLowerCase().replace(/_/g, '-').replace(/-range$/, '');
}

export type BucketingStrategy = 'defaultBucket' | 'defaultNoBucket';

export interface DimensionValue {
  name: string;
  title?: string;
  formula?: string;
  kind?: string;
  url?: string;
  granularities?: Granularity[];
  bucketedBy?: Granularity;
  bucketingStrategy?: BucketingStrategy;
  sortStrategy?: string;
}

export interface DimensionJS {
  name: string;
  title?: string;
  formula?: string;
  kind?: string;
  url?: string;
  granularities?: GranularityJS[];
  bucketedBy?: GranularityJS;
  bucketingStrategy?: BucketingStrategy;
  sortStrategy?: string;
}

var check: Class<DimensionValue, DimensionJS>;
export class Dimension implements Instance<DimensionValue, DimensionJS> {
  static defaultBucket: BucketingStrategy = 'defaultBucket';
  static defaultNoBucket: BucketingStrategy = 'defaultNoBucket';

  static isDimension(candidate: any): candidate is Dimension {
    return isInstanceOf(candidate, Dimension);
  }

  static getDimension(dimensions: List<Dimension>, dimensionName: string): Dimension {
    if (!dimensionName) return null;
    dimensionName = dimensionName.toLowerCase(); // Case insensitive
    return dimensions.find(dimension => dimension.name.toLowerCase() === dimensionName);
  }

  static getDimensionByExpression(dimensions: List<Dimension>, expression: Expression): Dimension {
    return dimensions.find(dimension => dimension.expression.equals(expression));
  }

  static fromJS(parameters: DimensionJS): Dimension {
    var parameterExpression = (parameters as any).expression; // Back compat
    var value: DimensionValue = {
      name: parameters.name,
      title: parameters.title,
      formula: parameters.formula || (typeof parameterExpression === 'string' ? parameterExpression : null),
      kind: parameters.kind || typeToKind((parameters as any).type),
      url: parameters.url
    };
    var granularities = parameters.granularities;
    if (granularities) {
      value.granularities = granularities.map(granularityFromJS);
    }

    var bucketedBy = parameters.bucketedBy;
    if (bucketedBy) {
      value.bucketedBy = granularityFromJS(bucketedBy);
    }

    var bucketingStrategy = parameters.bucketingStrategy;
    if (bucketingStrategy) {
      if (bucketingStrategy === 'defaultNoBucket') bucketingStrategy = Dimension.defaultNoBucket;
      if (bucketingStrategy === 'defaultBucket') bucketingStrategy = Dimension.defaultBucket;
      value.bucketingStrategy = bucketingStrategy;
    }

    var sortStrategy = parameters.sortStrategy;
    if (sortStrategy) {
      value.sortStrategy = sortStrategy;
    }

    return new Dimension(value);
  }

  public name: string;
  public title: string;
  public formula: string;
  public expression: Expression;
  public kind: string;
  public className: string;
  public url: string;
  public granularities: Granularity[];
  public bucketedBy: Granularity;
  public bucketingStrategy: BucketingStrategy;
  public sortStrategy: string;

  constructor(parameters: DimensionValue) {
    var name = parameters.name;
    verifyUrlSafeName(name);
    this.name = name;
    this.title = parameters.title || makeTitle(name);

    var formula = parameters.formula || $(name).toString();
    this.formula = formula;
    this.expression = Expression.parse(formula);

    var kind = parameters.kind || typeToKind(this.expression.type) || 'string';
    this.kind = kind;

    if (kind === 'string' && isGeo(name)) {
      this.className = 'string-geo';
    } else {
      this.className = kind;
    }
    if (parameters.url) {
      if (typeof parameters.url !== 'string') {
        throw new Error(`unsupported url: ${parameters.url}: only strings are supported`);
      }
      this.url = parameters.url;
    }

    var granularities = parameters.granularities;
    if (granularities) {
      if (!Array.isArray(granularities) || granularities.length !== 5) {
        throw new Error(`must have list of 5 granularities in dimension '${parameters.name}'`);
      }
      var runningActionType: string = null;
      this.granularities = granularities.map((g) => {
        if (runningActionType === null) runningActionType = g.action;
        if (g.action !== runningActionType) throw new Error("granularities must have the same type of actions");
        return g;
      });
    }
    if (parameters.bucketedBy) this.bucketedBy = parameters.bucketedBy;
    if (parameters.bucketingStrategy) this.bucketingStrategy = parameters.bucketingStrategy;
    if (parameters.sortStrategy) this.sortStrategy = parameters.sortStrategy;
  }

  public valueOf(): DimensionValue {
    return {
      name: this.name,
      title: this.title,
      formula: this.formula,
      kind: this.kind,
      url: this.url,
      granularities: this.granularities,
      bucketedBy: this.bucketedBy,
      bucketingStrategy: this.bucketingStrategy,
      sortStrategy: this.sortStrategy
    };
  }

  public toJS(): DimensionJS {
    var js: DimensionJS = {
      name: this.name,
      title: this.title,
      formula: this.formula,
      kind: this.kind
    };
    if (this.url) js.url = this.url;
    if (this.granularities) js.granularities = this.granularities.map((g) => { return granularityToJS(g); });
    if (this.bucketedBy) js.bucketedBy = granularityToJS(this.bucketedBy);
    if (this.bucketingStrategy) js.bucketingStrategy = this.bucketingStrategy;
    if (this.sortStrategy) js.sortStrategy = this.sortStrategy;
    return js;
  }

  public toJSON(): DimensionJS {
    return this.toJS();
  }

  public toString(): string {
    return `[Dimension: ${this.name}]`;
  }

  public equals(other: Dimension): boolean {
    return Dimension.isDimension(other) &&
      this.name === other.name &&
      this.title === other.title &&
      this.formula === other.formula &&
      this.kind === other.kind &&
      this.url === other.url &&
      immutableArraysEqual(this.granularities, other.granularities) &&
      granularityEquals(this.bucketedBy, other.bucketedBy) &&
      this.bucketingStrategy === other.bucketingStrategy &&
      this.sortStrategy === other.sortStrategy;
  }

  public canBucketByDefault(): boolean {
    return this.isContinuous() && this.bucketingStrategy !== Dimension.defaultNoBucket;
  }

  public isContinuous() {
    const { kind } = this;
    return kind === 'time' || kind === 'number';
  }

  change(propertyName: string, newValue: any): Dimension {
    var v = this.valueOf();

    if (!v.hasOwnProperty(propertyName)) {
      throw new Error(`Unknown property : ${propertyName}`);
    }

    (v as any)[propertyName] = newValue;
    return new Dimension(v);
  }

  changeKind(newKind: string): Dimension {
    return this.change('kind', newKind);
  }

  changeName(newName: string): Dimension {
    return this.change('name', newName);
  }

  changeTitle(newTitle: string): Dimension {
    return this.change('title', newTitle);
  }

  public changeFormula(newFormula: string): Dimension {
    return this.change('formula', newFormula);
  }

}
check = Dimension;
