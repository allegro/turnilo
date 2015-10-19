'use strict';

import { Class, Instance, isInstanceOf } from 'immutable-class';
import { Duration, Timezone } from 'chronoshift';
import { $, Expression } from 'plywood';
import { MaxTime } from '../max-time/max-time';

export interface RefreshRuleValue {
  rule: string; // 'fixed' / 'query' / 'dynamic'
  refresh?: Duration;
  time?: Date;
}

export interface RefreshRuleJS {
  rule: string;
  refresh?: string;
  time?: Date | string;
}

var check: Class<RefreshRuleValue, RefreshRuleJS>;
export class RefreshRule implements Instance<RefreshRuleValue, RefreshRuleJS> {

  static DEFAULT_QUERY_REFRESH = Duration.fromJS('PT1M');
  static REALTIME: RefreshRule;

  static isRefreshRule(candidate: any): boolean {
    return isInstanceOf(candidate, RefreshRule);
  }

  static query(refresh?: Duration): RefreshRule {
    return new RefreshRule({
      rule: 'query',
      refresh
    });
  }

  static fromJS(parameters: RefreshRuleJS): RefreshRule {
    var value: RefreshRuleValue = {
      rule: parameters.rule
    };
    if (parameters.refresh) {
      value.refresh = Duration.fromJS(parameters.refresh);
    }
    if (parameters.time) {
      value.time = new Date(<any>parameters.time);
    }
    return new RefreshRule(value);
  }


  public rule: string;
  public refresh: Duration;
  public time: Date;

  constructor(parameters: RefreshRuleValue) {
    var rule = parameters.rule;
    if (rule !== 'fixed' && rule !== 'query' && rule !== 'realtime') {
      throw new Error('rule must be on of: fixed, query, or realtime');
    }
    this.rule = rule;
    this.refresh = parameters.refresh;
    if (this.rule === 'query' && !this.refresh) {
      this.refresh = RefreshRule.DEFAULT_QUERY_REFRESH;
    }
    this.time = parameters.time;
  }

  public valueOf(): RefreshRuleValue {
    var value: RefreshRuleValue = {
      rule: this.rule
    };
    if (this.refresh) {
      value.refresh = this.refresh;
    }
    if (this.time) {
      value.time = this.time;
    }
    return value;
  }

  public toJS(): RefreshRuleJS {
    var js: RefreshRuleJS = {
      rule: this.rule
    };
    if (this.refresh) {
      js.refresh = this.refresh.toJS();
    }
    if (this.time) {
      js.time = this.time;
    }
    return js;
  }

  public toJSON(): RefreshRuleJS {
    return this.toJS();
  }

  public toString(): string {
    return `[RefreshRule: ${this.rule}]`;
  }

  public equals(other: RefreshRule): boolean {
    return RefreshRule.isRefreshRule(other) &&
      this.rule === other.rule &&
      Boolean(this.refresh) === Boolean(other.refresh) &&
      (!this.refresh || this.refresh.equals(other.refresh)) &&
      (!this.time || this.time.valueOf() === other.time.valueOf());
  }

  public isFixed(): boolean {
    return this.rule === 'fixed';
  }

  public isQuery(): boolean {
    return this.rule === 'query';
  }

  public isRealtime(): boolean {
    return this.rule === 'realtime';
  }

  public shouldQuery(maxTime: MaxTime): boolean {
    if (this.rule !== 'query') return false;
    if (!maxTime) return true;
    var { refresh } = this;
    if (!refresh) return false;
    return Date.now() - maxTime.updated.valueOf() > refresh.getCanonicalLength();
  }

}
check = RefreshRule;

RefreshRule.REALTIME = new RefreshRule({ rule: 'realtime' });
