/*
 * Copyright 2017-2021 Allegro.pl
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

import { NamedArray } from "immutable-class";
import {
  $,
  AttributeInfo,
  Attributes,
  basicExecutorFactory,
  Dataset,
  Executor,
  Expression,
  External,
  RefExpression
} from "plywood";
import { hasOwnProperty, makeUrlSafeName } from "../../utils/general/general";
import { createDimension } from "../dimension/dimension";
import {
  allDimensions,
  append as dimensionAppend,
  Dimensions,
  findDimensionByExpression,
  findDimensionByName,
  prepend as dimensionPrepend
} from "../dimension/dimensions";
import { measuresFromAttributeInfo } from "../measure/measure";
import {
  append as measureAppend,
  createMeasure,
  findMeasureByExpression,
  findMeasureByName,
  hasMeasureWithName,
  prepend as measurePrepend
} from "../measure/measures";
import { DataCube, getDefaultSortMeasure } from "./data-cube";

export interface QueryableDataCube extends DataCube {
  executor: Executor;
}

export function addAttributes(dataCube: DataCube, newAttributes: Attributes): DataCube {
  const { attributes, introspection } = dataCube;
  let { dimensions, measures } = dataCube;
  if (introspection === "none") return dataCube;

  const autofillDimensions = introspection === "autofill-dimensions-only" || introspection === "autofill-all";
  const autofillMeasures = introspection === "autofill-measures-only" || introspection === "autofill-all";

  const $main = $("main");

  for (const newAttribute of newAttributes) {
    const { name, type, nativeType } = newAttribute;

    // Already exists as a current attribute
    if (attributes && NamedArray.findByName(attributes, name)) continue;

    // Already exists as a current dimension or a measure
    const urlSafeName = makeUrlSafeName(name);
    if (findDimensionByName(dataCube.dimensions, urlSafeName) || findMeasureByName(dataCube.measures, urlSafeName)) continue;

    let expression: Expression;
    switch (type) {
      case "TIME":
        if (!autofillDimensions) continue;
        expression = $(name);
        if (findDimensionByExpression(dataCube.dimensions, expression)) continue;
        // Add to the start
        dimensions = dimensionPrepend(createDimension("time", urlSafeName, expression), dimensions);
        break;

      case "STRING":
        if (!autofillDimensions) continue;
        expression = $(name);
        if (findDimensionByExpression(dataCube.dimensions, expression)) continue;
        dimensions = dimensionAppend(createDimension("string", urlSafeName, expression), dimensions);
        break;

      case "SET/STRING":
        if (!autofillDimensions) continue;
        expression = $(name);
        if (findDimensionByExpression(dataCube.dimensions, expression)) continue;
        dimensions = dimensionAppend(createDimension("string", urlSafeName, expression, true), dimensions);
        break;

      case "BOOLEAN":
        if (!autofillDimensions) continue;
        expression = $(name);
        if (findDimensionByExpression(dataCube.dimensions, expression)) continue;
        dimensions = dimensionAppend(createDimension("boolean", urlSafeName, expression, true), dimensions);
        break;

      case "NUMBER":
      case "NULL":
        if (!autofillMeasures) continue;

        const newMeasures = measuresFromAttributeInfo(newAttribute);
        newMeasures.forEach(newMeasure => {
          if (findMeasureByExpression(dataCube.measures, newMeasure.expression)) return;
          measures = (name === "count")
            ? measurePrepend(measures, newMeasure)
            : measureAppend(measures, newMeasure);
        });
        break;

      default:
        throw new Error(`unsupported attribute ${name}; type ${type}, native type ${nativeType}`);
    }
  }

  if (dataCube.clusterName !== "druid" && !hasMeasureWithName(measures, "count")) {
    measures = measurePrepend(measures, createMeasure("count", $main.count()));
  }

  function getTimeAttribute(dimensions: Dimensions): RefExpression | undefined {
    const [first] = allDimensions(dimensions);
    if (first && first.kind === "time") {
      return first.expression as RefExpression;
    }
    return undefined;
  }

  return {
    ...dataCube,
    dimensions,
    measures,
    attributes: attributes ? AttributeInfo.override(attributes, newAttributes) : newAttributes,
    defaultSortMeasure: getDefaultSortMeasure(dataCube, measures),
    timeAttribute: dataCube.timeAttribute || getTimeAttribute(dimensions)
  };
}

export function attachDatasetExecutor(dataCube: DataCube, dataset: Dataset): QueryableDataCube {
  if (dataCube.clusterName !== "native") throw new Error("must be native to have a dataset");

  const executor = basicExecutorFactory({
    datasets: { main: dataset }
  });

  return {
    ...addAttributes(dataCube, dataset.attributes),
    executor
  };
}

export function attachExternalExecutor(dataCube: DataCube, external: External): QueryableDataCube {
  if (dataCube.clusterName === "native") throw new Error("can not be native and have an external");

  const executor = basicExecutorFactory({
    datasets: { main: external }
  });

  return {
    ...addAttributes(dataCube, external.attributes),
    executor
  };
}

export function isQueryable(dataCube: DataCube): dataCube is QueryableDataCube {
  return hasOwnProperty(dataCube, "executor") && Boolean((dataCube as QueryableDataCube).executor);
}
