'use strict';

import { $, Expression } from 'plywood';

export class Measure {
  public name: string;
  public title: string;
  public expression: Expression;

  constructor(name: string, title: string, expression: Expression) {
    title = title[0].toUpperCase() + title.substring(1);

    this.name = name;
    this.title = title;
    this.expression = expression;
  }
}
