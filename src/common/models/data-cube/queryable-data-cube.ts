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
  Dataset, Executor,
  Expression,
  External,
  RefExpression
} from "plywood";
import { hasOwnProperty, makeUrlSafeName } from "../../utils/general/general";
import { Dimension } from "../dimension/dimension";
import { Measure } from "../measure/measure";
import { DataCube } from "./data-cube";

export interface QueryableDataCube extends DataCube {
  executor: Executor;
}

function addAttributes(dataCube: DataCube, newAttributes: Attributes): DataCube {
  let { dimensions, measures, attributes, introspection } = dataCube;
  if (introspection === "none") return dataCube;

  const autofillDimensions = introspection === "autofill-dimensions-only" || introspection === "autofill-all";
  const autofillMeasures = introspection === "autofill-measures-only" || introspection === "autofill-all";

  const $main = $("main");

  for (let newAttribute of newAttributes) {
    const { name, type, nativeType } = newAttribute;

    // Already exists as a current attribute
    if (attributes && NamedArray.findByName(attributes, name)) continue;

    // Already exists as a current dimension or a measure
    const urlSafeName = makeUrlSafeName(name);
    if (dataCube.dimensions.getDimensionByName(urlSafeName) || dataCube.dimensions.getDimensionByName(urlSafeName)) continue;

    let expression: Expression;
    switch (type) {
      case "TIME":
        if (!autofillDimensions) continue;
        expression = $(name);
        if (dataCube.dimensions.getDimensionByExpression(expression)) continue;
        // Add to the start
        dimensions = dimensions.prepend(new Dimension({
          name: urlSafeName,
          kind: "time",
          formula: expression.toString()
        }));
        break;

      case "STRING":
        if (!autofillDimensions) continue;
        expression = $(name);
        if (dataCube.dimensions.getDimensionByExpression(expression)) continue;
        dimensions = dimensions.append(new Dimension({
          name: urlSafeName,
          formula: expression.toString()
        }));
        break;

      case "SET/STRING":
        if (!autofillDimensions) continue;
        expression = $(name);
        if (dataCube.dimensions.getDimensionByExpression(expression)) continue;
        dimensions = dimensions.append(new Dimension({
          kind: "string",
          multiValue: true,
          name: urlSafeName,
          formula: expression.toString()
        }));
        break;

      case "BOOLEAN":
        if (!autofillDimensions) continue;
        expression = $(name);
        if (dataCube.dimensions.getDimensionByExpression(expression)) continue;
        dimensions = dimensions.append(new Dimension({
          name: urlSafeName,
          kind: "boolean",
          formula: expression.toString()
        }));
        break;

      case "NUMBER":
      case "NULL":
        if (!autofillMeasures) continue;

        const newMeasures = Measure.measuresFromAttributeInfo(newAttribute);
        newMeasures.forEach(newMeasure => {
          if (dataCube.measures.getMeasureByExpression(newMeasure.expression)) return;
          measures = (name === "count") ? measures.prepend(newMeasure) : measures.append(newMeasure);
        });
        break;

      default:
        throw new Error(`unsupported attribute ${name}; type ${type}, native type ${nativeType}`);
    }
  }

  if (dataCube.clusterName !== "druid" && !measures.containsMeasureWithName("count")) {
    measures = measures.prepend(new Measure({
      name: "count",
      formula: $main.count().toString()
    }));
  }

  // TODO: FIX mutation!
  let value = dataCube;
  value.attributes = attributes ? AttributeInfo.override(attributes, newAttributes) : newAttributes;
  value.dimensions = dimensions;
  value.measures = measures;

  if (!value.defaultSortMeasure) {
    value.defaultSortMeasure = measures.size() ? measures.first().name : null;
  }

  if (!value.timeAttribute && dimensions.size && dimensions.first().kind === "time") {
    value.timeAttribute = dimensions.first().expression as RefExpression;
  }

  return value;
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
