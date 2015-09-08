'use strict';

import { Class, Instance, isInstanceOf } from 'immutable-class';

export interface MarinParameters {
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

// ToDo: make this a higher object
export class Stage {
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

  public getTransform(): string {
    return `translate(${this.x},${this.y})`;
  }

  public within(param: MarinParameters): Stage {
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
