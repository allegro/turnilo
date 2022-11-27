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

import { Expression } from "plywood";
import { values } from "../../utils/functional/functional";
import { isTruthy, makeTitle } from "../../utils/general/general";
import { mapValues } from "../../utils/object/object";
import { measureDefaultFormat } from "../series/series-format";
import {
  fromConfig as measureFromConfig,
  Measure,
  MeasureJS,
  serialize as serializeMeasure,
  SerializedMeasure
} from "./measure";

type MeasureId = string;
export type MeasureOrGroupJS = MeasureJS | MeasureGroupJS;
export type MeasureOrGroup = MeasureId | MeasuresGroup;

export function isMeasure(o: MeasureOrGroup): o is MeasureId {
  return typeof o === "string";
}

export interface MeasureGroupJS {
  name: string;
  title?: string;
  description?: string;
  measures: MeasureOrGroupJS[];
}

export function isMeasureGroupJS(measureOrGroupJS: MeasureOrGroupJS): measureOrGroupJS is MeasureGroupJS {
  return (measureOrGroupJS as MeasureGroupJS).measures !== undefined;
}

export interface MeasuresGroup {
  name: string;
  title?: string;
  description?: string;
  measures: MeasureOrGroup[];
}

export interface Measures {
  tree: MeasureOrGroup[];
  byName: Record<MeasureId, Measure>;
}

export function fromConfig(config: MeasureOrGroupJS[]): Measures {
  const byName: Record<MeasureId, Measure> = {};

  function readMeasureOrGroup(measureOrGroup: MeasureOrGroupJS): MeasureOrGroup {
    if (isMeasureGroupJS(measureOrGroup)) {
      const { name, title, description, measures } = measureOrGroup;
      if (name == null) {
        throw new Error("measure group requires a name");
      }

      if (!Array.isArray(measures) || measures.length === 0) {
        throw new Error(`measure group '${name}' has no measures`);
      }
      return {
        name,
        title: title || makeTitle(name),
        description,
        measures: measures.map(readMeasureOrGroup)
      };
    } else {
      const measure = measureFromConfig(measureOrGroup);
      const { name } = measure;
      if (isTruthy(byName[name])) {
        throw new Error(`found duplicate measure with name: '${name}'`);
      }
      byName[name] = measure;
      return name;
    }
  }

  const tree = config.map(readMeasureOrGroup);

  return {
    tree,
    byName
  };
}

export interface SerializedMeasures {
  tree: MeasureOrGroup[];
  byName: Record<MeasureId, SerializedMeasure>;
}

export type ClientMeasures = Measures;

export function serialize({ tree, byName }: Measures): SerializedMeasures {
  return {
    tree,
    byName: mapValues(byName, serializeMeasure)
  };
}

export function allMeasures(measures: Measures): Measure[] {
  return values(measures.byName);
}

export function findMeasureByName(measures: Measures, measureName: string): Measure | null {
  return measures.byName[measureName] || null;
}

export function hasMeasureWithName(measures: Measures, measureName: string): boolean {
  return isTruthy(findMeasureByName(measures, measureName));
}

export function findMeasureByExpression(measures: Measures, expression: Expression): Measure | null {
  return values(measures.byName).find(measure => measure.expression.equals(expression)) || null;
}

export function append(measures: Measures, measure: Measure): Measures {
  const { name } = measure;
  return {
    byName: {
      ...measures.byName,
      [name]: measure
    },
    tree: [...measures.tree, name]
  };
}

export function prepend(measures: Measures, measure: Measure): Measures {
  const { name } = measure;
  return {
    byName: {
      ...measures.byName,
      [name]: measure
    },
    tree: [name, ...measures.tree]
  };
}

export function createMeasure(name: string, expression: Expression): Measure {
  return {
    format: measureDefaultFormat,
    lowerIsBetter: false,
    transformation: "none",
    name,
    title: makeTitle(name),
    expression
  };
}
