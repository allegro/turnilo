import * as React from 'react';
import { Class, Instance, isInstanceOf } from 'immutable-class';

export interface MarginParameters {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}

export interface StageValue {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface StageJS {
  x: number;
  y: number;
  width: number;
  height: number;
}

var check: Class<StageValue, StageJS>;
export class Stage implements Instance<StageValue, StageJS> {
  static isStage(candidate: any): candidate is Stage {
    return isInstanceOf(candidate, Stage);
  }

  static fromJS(parameters: StageJS): Stage {
    return new Stage({
      x: parameters.x,
      y: parameters.y,
      width: parameters.width,
      height: parameters.height
    });
  }


  static fromClientRect(rect: ClientRect): Stage {
    return new Stage({
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height
    });
  }

  static fromSize(width: number, height: number): Stage {
    return new Stage({
      x: 0,
      y: 0,
      width,
      height
    });
  }


  public x: number;
  public y: number;
  public width: number;
  public height: number;

  constructor(parameters: StageValue) {
    this.x = parameters.x;
    this.y = parameters.y;
    this.width = parameters.width;
    this.height = parameters.height;
  }

  public valueOf(): StageValue {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }

  public toJS(): StageJS {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }

  public toJSON(): StageJS {
    return this.toJS();
  }

  private sizeOnlyValue(): StageValue {
    return {
      x: 0,
      y: 0,
      width: this.width,
      height: this.height
    };
  }

  public toString(): string {
    return `[stage: ${this.width}x${this.height}}]`;
  }

  public equals(other: Stage): boolean {
    return Stage.isStage(other) &&
      this.x === other.x &&
      this.y === other.y &&
      this.width === other.width &&
      this.height === other.height;
  }

  public getTransform(): string {
    return `translate(${this.x},${this.y})`;
  }

  public getLeftTop(): React.CSSProperties {
    return {
      left: this.x,
      top: this.y
    };
  }

  public getWidthHeight(): React.CSSProperties {
    return {
      width: this.width,
      height: this.height
    };
  }

  public getLeftTopWidthHeight(): React.CSSProperties {
    return {
      left: this.x,
      top: this.y,
      width: this.width,
      height: this.height
    };
  }

  public within(param: MarginParameters): Stage {
    var value = this.sizeOnlyValue();
    var { left, right, top, bottom } = param;

    if (left) {
      value.x = left;
      value.width -= left;
    }

    if (right) {
      value.width -= right;
    }

    if (top) {
      value.y = top;
      value.height -= top;
    }

    if (bottom) {
      value.height -= bottom;
    }

    return new Stage(value);
  }
}
check = Stage;
