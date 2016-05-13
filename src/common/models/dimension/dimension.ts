import { List } from 'immutable';
import { Class, Instance, isInstanceOf } from 'immutable-class';
import { $, Expression, ExpressionJS, Action, NumberRangeJS, ApplyAction } from 'plywood';
import { verifyUrlSafeName, makeTitle } from '../../utils/general/general';
import { Granularity, GranularityJS, granularityFromJS, granularityToJS } from "../granularity/granularity";
import { immutableArraysEqual } from "immutable-class";

var geoName = /continent|country|city|region/i;
function isGeo(name: string): boolean {
  return geoName.test(name);
}

function typeToKind(type: string): string {
  if (!type) return type;
  return type.toLowerCase().replace(/_/g, '-').replace(/-range$/, '');
}

export interface DimensionValue {
  name: string;
  title?: string;
  expression?: Expression;
  kind?: string;
  url?: string;
  granularities?: Granularity[];
}

export interface DimensionJS {
  name: string;
  title?: string;
  expression?: ExpressionJS | string;
  kind?: string;
  url?: string;
  granularities?: GranularityJS[];
}

var check: Class<DimensionValue, DimensionJS>;
export class Dimension implements Instance<DimensionValue, DimensionJS> {
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
    var value: DimensionValue = {
      name: parameters.name,
      title: parameters.title,
      expression: parameters.expression ? Expression.fromJSLoose(parameters.expression) : null,
      kind: parameters.kind || typeToKind((parameters as any).type),
      url: parameters.url
    };
    var granularities = parameters.granularities;
    if (granularities) {
      if (!Array.isArray(granularities) || granularities.length !== 5) {
        throw new Error(`must have list of 5 granularities in dimension '${parameters.name}'`);
      }

      var runningActionType: string = null;
      value.granularities = granularities.map((g) => {
        var granularity = granularityFromJS(g);
        if (runningActionType === null) runningActionType = granularity.action;
        if (granularity.action !== runningActionType) throw new Error("granularities must have the same type of actions");
        return granularity;
      });
    }

    return new Dimension(value);
  }

  public name: string;
  public title: string;
  public expression: Expression;
  public kind: string;
  public className: string;
  public url: string;
  public granularities: Granularity[];

  constructor(parameters: DimensionValue) {
    var name = parameters.name;
    verifyUrlSafeName(name);
    this.name = name;
    this.title = parameters.title || makeTitle(name);
    this.expression = parameters.expression || $(name);
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

    if (parameters.granularities) this.granularities = parameters.granularities;
  }

  public valueOf(): DimensionValue {
    return {
      name: this.name,
      title: this.title,
      expression: this.expression,
      kind: this.kind,
      url: this.url,
      granularities: this.granularities
    };
  }

  public toJS(): DimensionJS {
    var js: DimensionJS = {
      name: this.name,
      title: this.title,
      expression: this.expression.toJS(),
      kind: this.kind
    };
    if (this.url) js.url = this.url;
    if (this.granularities) js.granularities = this.granularities.map((g) => { return granularityToJS(g); });
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
      this.kind === other.kind &&
      this.url === other.url &&
      immutableArraysEqual(this.granularities, other.granularities);
  }

  public isContinuous() {
    return this.kind === 'time';
    // more later?
  }
}
check = Dimension;
