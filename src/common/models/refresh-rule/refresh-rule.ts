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
import { Duration } from 'chronoshift';

export interface RefreshRuleValue {
  rule: string;
  time?: Date;
}

export interface RefreshRuleJS {
  rule: string;
  time?: Date | string;
}

var check: Class<RefreshRuleValue, RefreshRuleJS>;
export class RefreshRule implements Instance<RefreshRuleValue, RefreshRuleJS> {

  static FIXED = 'fixed';
  static QUERY = 'query';
  static REALTIME = 'realtime';

  static isRefreshRule(candidate: any): candidate is RefreshRule {
    return isInstanceOf(candidate, RefreshRule);
  }

  static query(): RefreshRule {
    return new RefreshRule({
      rule: RefreshRule.QUERY
    });
  }

  static fromJS(parameters: RefreshRuleJS): RefreshRule {
    var value: RefreshRuleValue = {
      rule: parameters.rule
    };
    if (parameters.time) {
      value.time = new Date(<any>parameters.time);
    }
    return new RefreshRule(value);
  }


  public rule: string;
  public time: Date;

  constructor(parameters: RefreshRuleValue) {
    var rule = parameters.rule;
    if (rule !== RefreshRule.FIXED && rule !== RefreshRule.QUERY && rule !== RefreshRule.REALTIME) {
      throw new Error(`rule must be on of: ${RefreshRule.FIXED}, ${RefreshRule.QUERY}, or ${RefreshRule.REALTIME}`);
    }
    this.rule = rule;
    this.time = parameters.time;
  }

  public valueOf(): RefreshRuleValue {
    var value: RefreshRuleValue = {
      rule: this.rule
    };
    if (this.time) {
      value.time = this.time;
    }
    return value;
  }

  public toJS(): RefreshRuleJS {
    var js: RefreshRuleJS = {
      rule: this.rule
    };
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

}
check = RefreshRule;
