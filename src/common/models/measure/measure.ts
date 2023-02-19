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

import { $, AttributeInfo, CountDistinctExpression, Expression, ExpressionJS, QuantileExpression } from "plywood";
import { makeTitle, makeUrlSafeName, verifyUrlSafeName } from "../../utils/general/general";
import some from "../../utils/plywood/some";
import { SeriesDerivation } from "../series/concrete-series";
import { measureDefaultFormat } from "../series/series-format";
import { createMeasure } from "./measures";

export interface MeasureJS {
  name: string;
  title?: string;
  units?: string;
  formula?: string;
  format?: string;
  transformation?: Transformation;
  description?: string;
  lowerIsBetter?: boolean;
}

type Transformation = "none" | "percent-of-parent" | "percent-of-total";

const DEFAULT_FORMAT = measureDefaultFormat;
const DEFAULT_TRANSFORMATION = "none";
const TRANSFORMATIONS: Set<Transformation> = new Set(["none", "percent-of-parent", "percent-of-total"] as Transformation[]);

export interface Measure {
  name: string;
  title: string;
  units?: string;
  expression: Expression;
  format: string;
  transformation: Transformation;
  description?: string;
  lowerIsBetter: boolean;
}

export interface SerializedMeasure {
  name: string;
  title: string;
  units?: string;
  expression: ExpressionJS;
  format: string;
  transformation: Transformation;
  description?: string;
  lowerIsBetter: boolean;
}

export type ClientMeasure = Measure;

export function serialize(measure: Measure): SerializedMeasure {
  return {
    ...measure,
    expression: measure.expression.toJS()
  };
}

interface LegacyMeasureJS {
  expression?: string;
}

function readFormula({ formula, expression, name }: MeasureJS & LegacyMeasureJS): Expression {
  if (formula) return Expression.parse(formula);
  if (expression) return Expression.parse(expression);
  return $("main").sum($(name));
}

function verifyName(name: string) {
  verifyUrlSafeName(name);
  if (name.startsWith(SeriesDerivation.PREVIOUS)) {
    throw new Error(`measure ${name} starts with forbidden prefix: ${SeriesDerivation.PREVIOUS}`);
  }
  if (name.startsWith(SeriesDerivation.DELTA)) {
    throw new Error(`measure ${name} starts with forbidden prefix: ${SeriesDerivation.DELTA}`);
  }
}

export function fromConfig(config: MeasureJS & LegacyMeasureJS): Measure {
  const { name, title, units, format, transformation, description, lowerIsBetter } = config;
  verifyName(name);
  if (transformation && !TRANSFORMATIONS.has(transformation)) {
    throw new Error(`Incorrect transformation (${transformation}) for measure ${name}`);
  }

  const expression = readFormula(config);

  return {
    name,
    title: title || makeTitle(name),
    units,
    format: format || DEFAULT_FORMAT,
    expression,
    description,
    lowerIsBetter: Boolean(lowerIsBetter),
    transformation: transformation || DEFAULT_TRANSFORMATION
  };
}

export function measuresFromAttributeInfo(attribute: AttributeInfo): Measure[] {
  const { name, nativeType } = attribute;
  const $main = $("main");
  const ref = $(name);

  if (nativeType) {
    if (nativeType === "hyperUnique" || nativeType === "thetaSketch" || nativeType === "HLLSketch") {
      return [createMeasure(makeUrlSafeName(name), $main.countDistinct(ref))];
    } else if (nativeType === "approximateHistogram" || nativeType === "quantilesDoublesSketch") {
      return [createMeasure(makeUrlSafeName(name + "_p98"), $main.quantile(ref, 0.98))];
    }
  }

  let expression: Expression = $main.sum(ref);
  const makerAction = attribute.maker;
  if (makerAction) {
    switch (makerAction.op) {
      case "min":
        expression = $main.min(ref);
        break;

      case "max":
        expression = $main.max(ref);
        break;

      // default: // sum, count
    }
  }

  return [createMeasure(makeUrlSafeName(name), expression)];
}

export function getTitleWithUnits(measure: ClientMeasure): string {
  if (measure.units) {
    return `${measure.title} (${measure.units})`;
  } else {
    return measure.title;
  }
}

function hasCountDistinctReferences(ex: Expression): boolean {
  return some(ex, e => e instanceof CountDistinctExpression);
}

function hasQuantileReferences(ex: Expression): boolean {
  return some(ex, e => e instanceof QuantileExpression);
}

export function isApproximate(measure: ClientMeasure): boolean {
  return hasCountDistinctReferences(measure.expression) || hasQuantileReferences(measure.expression);
}

export function isQuantile(measure: ClientMeasure) {
  return measure.expression instanceof QuantileExpression;
}
