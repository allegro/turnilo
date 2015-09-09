'use strict';

import { Class, Instance, isInstanceOf } from 'immutable-class';
import { $, Expression, ExpressionJS, Action } from 'plywood';
import { makeTitle } from '../../utils/general';
import { SplitCombine } from '../split-combine/split-combine';

var geoNames = [
  'continent',
  'country',
  'city',
  'region'
];
function isGeo(name: string): boolean {
  return geoNames.indexOf(name) !== -1;
}

export interface DimensionValue {
  name: string;
  title: string;
  expression: Expression;
  type: string;
  sortOn: string;
}

export interface DimensionJS {
  name: string;
  title?: string;
  expression?: ExpressionJS;
  type?: string;
  sortOn?: string;
}

var check: Class<DimensionValue, DimensionJS>;
export class Dimension implements Instance<DimensionValue, DimensionJS> {
  static isDimension(candidate: any): boolean {
    return isInstanceOf(candidate, Dimension);
  }

  static fromJS(parameters: DimensionJS): Dimension {
    return new Dimension({
      name: parameters.name,
      title: parameters.title,
      expression: parameters.expression ? Expression.fromJSLoose(parameters.expression) : null,
      type: parameters.type || 'STRING',
      sortOn: parameters.sortOn || null
    });
  }


  public name: string;
  public title: string;
  public expression: Expression;
  public type: string;
  public sortOn: string;
  public className: string;

  constructor(parameters: DimensionValue) {
    var name = parameters.name;
    this.name = name;
    this.title = parameters.title || makeTitle(name);
    this.expression = parameters.expression || $(name);
    var type = parameters.type;
    this.type = type;
    this.sortOn = parameters.sortOn;

    if (type === 'STRING' && isGeo(name)) {
      this.className = 'type-string-geo';
    } else {
      this.className = 'type-' + type.toLowerCase().replace(/_/g, '-');
    }
  }

  public valueOf(): DimensionValue {
    return {
      name: this.name,
      title: this.title,
      expression: this.expression,
      type: this.type,
      sortOn: this.sortOn
    };
  }

  public toJS(): DimensionJS {
    var js: DimensionJS = {
      name: this.name,
      title: this.title,
      expression: this.expression.toJS(),
      type: this.type
    };
    if (this.sortOn) js.sortOn = this.sortOn;
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
      this.expression.equals(other.expression) &&
      this.type === other.type &&
      this.sortOn === other.sortOn;
  }

  public getBucketAction(): Action {
    if (this.type === 'TIME') {
      return Action.fromJS({
        action: 'timeBucket',
        duration: 'PT1H',
        timezone: 'Etc/UTC'
      });
    }
    return null;
  }

  public getSplitCombine(): SplitCombine {
    return new SplitCombine({
      expression: this.expression,
      bucketAction: this.getBucketAction(),
      sortAction: null,
      limitAction: null
    });
  }
}
check = Dimension;
