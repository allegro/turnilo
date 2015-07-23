'use strict';

import { $, Expression, SortAction, LimitAction } from 'plywood';

export class SplitCombine {
  public splitExpression: Expression;
  public sortAction: SortAction;
  public limitAction: LimitAction;

  constructor(splitExpression: Expression, sortAction: SortAction, limitAction: LimitAction) {
    this.splitExpression = splitExpression;
    this.sortAction = sortAction;
    this.limitAction = limitAction;
  }
}
