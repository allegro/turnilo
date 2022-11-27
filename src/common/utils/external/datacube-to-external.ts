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
  AttributeInfo,
  Attributes,
  deduplicateSort,
  Expression,
  External,
  ExternalValue,
  RefExpression
} from "plywood";
import { DataCube } from "../../models/data-cube/data-cube";
import { allDimensions } from "../../models/dimension/dimensions";
import { isApproximate } from "../../models/measure/measure";
import { allMeasures } from "../../models/measure/measures";

function getReferences(ex: Expression): string[] {
  let references: string[] = [];
  ex.forEach((sub: Expression) => {
    if (sub instanceof RefExpression && sub.name !== "main") {
      references = references.concat(sub.name);
    }
  });
  return deduplicateSort(references);
}

/**
 * This function tries to deduce the structure of the dataCube based on the dimensions and measures defined within.
 * It should only be used when, for some reason, introspection if not available.
 */
export function deduceAttributes(dataCube: DataCube): Attributes {
  const { dimensions, measures, timeAttribute, attributeOverrides } = dataCube;
  let attributes: Attributes = [];

  if (timeAttribute) {
    attributes.push(AttributeInfo.fromJS({ name: timeAttribute.name, type: "TIME" }));
  }

  allDimensions(dimensions).forEach(dimension => {
    const expression = dimension.expression;
    if (expression.equals(timeAttribute)) return;
    const references = expression.getFreeReferences();
    for (const reference of references) {
      if (NamedArray.findByName(attributes, reference)) continue;
      attributes.push(AttributeInfo.fromJS({ name: reference, type: "STRING" }));
    }
  });

  allMeasures(measures).forEach(measure => {
    const references = getReferences(measure.expression);
    for (const reference of references) {
      if (NamedArray.findByName(attributes, reference)) continue;
      if (isApproximate(measure)) continue;
      attributes.push(AttributeInfo.fromJS({ name: reference, type: "NUMBER" }));
    }
  });

  if (attributeOverrides.length) {
    attributes = AttributeInfo.override(attributes, attributeOverrides);
  }

  return attributes;
}

export default function dataCubeToExternal(dataCube: DataCube): External {
  if (dataCube.clusterName === "native") throw new Error("there is no external on a native data cube");
  const { cluster, options } = dataCube;
  if (!cluster) throw new Error("must have a cluster");

  const externalValue: ExternalValue = {
    engine: cluster.type,
    suppress: true,
    source: dataCube.source,
    version: cluster.version,
    derivedAttributes: dataCube.derivedAttributes,
    customAggregations: options.customAggregations,
    customTransforms: options.customTransforms,
    filter: dataCube.subsetExpression
  };

  if (cluster.type === "druid") {
    externalValue.rollup = dataCube.rollup;
    externalValue.timeAttribute = dataCube.timeAttribute.name;
    externalValue.introspectionStrategy = cluster.introspectionStrategy;
    externalValue.allowSelectQueries = true;

    const externalContext: Record<string, unknown> = {
      timeout: cluster.timeout,
      ...options.druidContext
    };
    externalValue.context = externalContext;
  }

  if (dataCube.introspection === "none") {
    externalValue.attributes = AttributeInfo.override(deduceAttributes(dataCube), dataCube.attributeOverrides);
    externalValue.derivedAttributes = dataCube.derivedAttributes;
  } else {
    // ToDo: else if (we know that it will GET introspect) and there are no overrides apply special attributes as overrides
    externalValue.attributeOverrides = dataCube.attributeOverrides;
  }

  return External.fromValue(externalValue);
}
