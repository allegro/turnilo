/*
 * Copyright 2015-2016 Imply Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Class, Instance, isInstanceOf } from 'immutable-class';
import { Duration, Timezone } from 'chronoshift';
import { $, Expression } from 'plywood';
import { MaxTime } from '../max-time/max-time';

export interface RefreshRuleValue {
  rule: string;
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

  static FIXED = 'fixed';
  static QUERY = 'query';
  static REALTIME = 'realtime';

  static DEFAULT_QUERY_REFRESH = Duration.fromJS('PT1M');

  static isRefreshRule(candidate: any): candidate is RefreshRule {
    return isInstanceOf(candidate, RefreshRule);
  }

  static query(refresh?: Duration): RefreshRule {
    return new RefreshRule({
      rule: RefreshRule.QUERY,
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
    if (rule !== RefreshRule.FIXED && rule !== RefreshRule.QUERY && rule !== RefreshRule.REALTIME) {
      throw new Error(`rule must be on of: ${RefreshRule.FIXED}, ${RefreshRule.QUERY}, or ${RefreshRule.REALTIME}`);
    }
    this.rule = rule;
    this.refresh = parameters.refresh;
    if (this.rule !== RefreshRule.FIXED && !this.refresh) {
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
    return this.rule === RefreshRule.FIXED;
  }

  public isQuery(): boolean {
    return this.rule === RefreshRule.QUERY;
  }

  public isRealtime(): boolean {
    return this.rule === RefreshRule.REALTIME;
  }

  public shouldUpdate(maxTime: MaxTime): boolean {
    if (this.isFixed()) return false;
    if (!maxTime) return true;
    var { refresh } = this;
    if (!refresh) return false;
    return Date.now() - maxTime.updated.valueOf() > refresh.getCanonicalLength();
  }

}
check = RefreshRule;
