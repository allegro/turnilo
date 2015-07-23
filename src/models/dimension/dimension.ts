'use strict';

import { $, Expression } from 'plywood';

export class Dimension {
  public name: string;
  public title: string;
  public expression: Expression;
  public type: string;

  constructor(name: string, title: string, expression: Expression, type: string) {
    title = title[0].toUpperCase() + title.substring(1);

    this.name = name;
    this.title = title;
    this.expression = expression;
    this.type = type;
  }
}
