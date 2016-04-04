import { List } from 'immutable';
import { Class, Instance, isInstanceOf } from 'immutable-class';
import { $, Expression, ExpressionJS, Action } from 'plywood';
import { verifyUrlSafeName, makeTitle } from '../../utils/general/general';

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
}

export interface DimensionJS {
  name: string;
  title?: string;
  expression?: ExpressionJS | string;
  kind?: string;
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
    return new Dimension({
      name: parameters.name,
      title: parameters.title,
      expression: parameters.expression ? Expression.fromJSLoose(parameters.expression) : null,
      kind: parameters.kind || typeToKind((parameters as any).type)
    });
  }


  public name: string;
  public title: string;
  public expression: Expression;
  public kind: string;
  public className: string;

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
  }

  public valueOf(): DimensionValue {
    return {
      name: this.name,
      title: this.title,
      expression: this.expression,
      kind: this.kind
    };
  }

  public toJS(): DimensionJS {
    return {
      name: this.name,
      title: this.title,
      expression: this.expression.toJS(),
      kind: this.kind
    };
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
      this.kind === other.kind;
  }
}
check = Dimension;
