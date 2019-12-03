/*
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

import { immutableArraysEqual, Instance } from "immutable-class";
import { makeTitle } from "../../utils/general/general";
import { Measure, MeasureJS } from "./measure";

export type MeasureOrGroupJS = MeasureJS | MeasureGroupJS;
export type MeasureOrGroup = Measure | MeasureGroup;

export interface MeasureGroupJS {
  name: string;
  title?: string;
  description?: string;
  measures: MeasureOrGroupJS[];
}

export interface MeasureGroupValue {
  name: string;
  title?: string;
  description?: string;
  measures: MeasureOrGroup[];
}

export interface MeasureOrGroupVisitor<R> {
  visitMeasure(measure: Measure): R;

  visitMeasureGroup(measureGroup: MeasureGroup): R;
}

export function measureOrGroupFromJS(measureOrGroup: MeasureOrGroupJS): MeasureOrGroup {
  if (isMeasureGroupJS(measureOrGroup)) {
    return MeasureGroup.fromJS(measureOrGroup);
  } else {
    return Measure.fromJS(measureOrGroup);
  }
}

export function isMeasureGroupJS(measureOrGroupJS: MeasureOrGroupJS): measureOrGroupJS is MeasureGroupJS {
  return (measureOrGroupJS as MeasureGroupJS).measures !== undefined;
}

export class MeasureGroup implements Instance<MeasureGroupValue, MeasureGroupJS> {
  static fromJS(parameters: MeasureGroupJS): MeasureGroup {
    const { name, title, description, measures } = parameters;

    if (name == null) {
      throw new Error("measure group requires a name");
    }

    if (measures == null || measures.length === 0) {
      throw new Error(`measure group '${name}' has no measures`);
    }

    return new MeasureGroup({
      name,
      title,
      description,
      measures: measures.map(measureOrGroupFromJS)
    });
  }

  static isMeasureGroup(candidate: any): candidate is MeasureGroup {
    return candidate instanceof MeasureGroup;
  }

  readonly name: string;
  readonly title: string;
  readonly description: string;
  readonly type = "group";
  readonly measures: MeasureOrGroup[];

  constructor(parameters: MeasureGroupValue) {
    this.name = parameters.name;
    this.title = parameters.title || makeTitle(parameters.name);
    this.description = parameters.description;
    this.measures = parameters.measures;
  }

  accept<R>(visitor: MeasureOrGroupVisitor<R>): R {
    return visitor.visitMeasureGroup(this);
  }

  equals(other: any): boolean {
    return this === other
      || MeasureGroup.isMeasureGroup(other) && immutableArraysEqual(this.measures, other.measures);
  }

  toJS(): MeasureGroupJS {
    let measureGroup: MeasureGroupJS = {
      name: this.name,
      measures: this.measures.map(measure => measure.toJS()),
      title: this.title
    };
    if (this.description) measureGroup.description = this.description;
    return measureGroup;
  }

  toJSON(): MeasureGroupJS {
    return this.toJS();
  }

  valueOf(): MeasureGroupValue {
    let measureGroup: MeasureGroupValue = {
      name: this.name,
      title: this.title,
      measures: this.measures
    };
    if (this.description) measureGroup.description = this.description;
    return measureGroup;
  }
}
