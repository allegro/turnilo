/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2019 Allegro.pl
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

import { Class, Instance } from "immutable-class";
import { hasOwnProperty } from "../../utils/general/general";

export interface DragPositionValue {
  insert?: number;
  replace?: number;
}

export interface DragPositionJS {
  insert?: number;
  replace?: number;
}

let check: Class<DragPositionValue, DragPositionJS>;

export class DragPosition implements Instance<DragPositionValue, DragPositionJS> {

  static isDragPosition(candidate: any): candidate is DragPosition {
    return candidate instanceof DragPosition;
  }

  static calculateFromOffset(offset: number, numItems: number, itemWidth: number, itemGap: number): DragPosition {
    if (!numItems) {
      return new DragPosition({
        replace: 0
      });
    }

    if (offset < 0) {
      return new DragPosition({
        insert: 0
      });
    }

    const sectionWidth = itemWidth + itemGap;
    const sectionNumber = Math.floor(offset / sectionWidth);
    if (numItems <= sectionNumber) {
      return new DragPosition({
        replace: numItems
      });
    }

    const offsetWithinSection = offset - sectionWidth * sectionNumber;
    if (offsetWithinSection < itemWidth) {
      return new DragPosition({
        replace: sectionNumber
      });
    } else {
      return new DragPosition({
        insert: sectionNumber + 1
      });
    }
  }

  static fromJS(parameters: DragPositionJS): DragPosition {
    return new DragPosition(parameters);
  }

  static insertAt(index: number): DragPosition {
    return new DragPosition({ insert: index });
  }

  static replaceAt(index: number): DragPosition {
    return new DragPosition({ replace: index });
  }

  public insert: number;
  public replace: number;

  constructor(parameters: DragPositionValue) {
    this.insert = hasOwnProperty(parameters, "insert") ? parameters.insert : null;
    this.replace = hasOwnProperty(parameters, "replace") ? parameters.replace : null;
    if (this.insert == null && this.replace == null) throw new Error("invalid drag position");
  }

  public valueOf(): DragPositionValue {
    return {
      insert: this.insert,
      replace: this.replace
    };
  }

  public toJS(): DragPositionJS {
    const js: DragPositionJS = {};
    if (this.insert != null) js.insert = this.insert;
    if (this.replace != null) js.replace = this.replace;
    return js;
  }

  public toJSON(): DragPositionJS {
    return this.toJS();
  }

  public toString(): string {
    if (this.insert != null) {
      return `[insert ${this.insert}]`;
    } else {
      return `[replace ${this.replace}]`;
    }
  }

  public equals(other: DragPosition): boolean {
    return DragPosition.isDragPosition(other) &&
      this.insert === other.insert &&
      this.replace === other.replace;
  }

  public isInsert(): boolean {
    return this.insert !== null;
  }

  public isReplace(): boolean {
    return this.replace !== null;
  }

  public getIndex(): number {
    return this.isInsert() ? this.insert : this.replace;
  }

}

check = DragPosition;
