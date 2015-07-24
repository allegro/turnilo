'use strict';

import { $, Expression, SortAction, LimitAction } from 'plywood';

export class SplitCombine {
  public splitOn: Expression;
  public sortAction: SortAction;
  public limitAction: LimitAction;

  constructor(splitOn: Expression, sortAction: SortAction, limitAction: LimitAction) {
    this.splitOn = splitOn;
    this.sortAction = sortAction;
    this.limitAction = limitAction;
  }
}
