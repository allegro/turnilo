/*
 * Copyright 2017-2018 Allegro.pl
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

import { Timezone } from "chronoshift";
import { OrderedSet } from "immutable";
import { NamedArray } from "immutable-class";
import { AndExpression, Expression, OverlapExpression, TimeBucketExpression } from "plywood";
import { Colors } from "../../models/colors/colors";
import { DataCube } from "../../models/data-cube/data-cube";
import { createMeasures, Essence } from "../../models/essence/essence";
import { Filter } from "../../models/filter/filter";
import { Highlight } from "../../models/highlight/highlight";
import { Manifest } from "../../models/manifest/manifest";
import { Splits } from "../../models/splits/splits";
import { TimeShift } from "../../models/time-shift/time-shift";
import { ViewDefinitionConverter } from "../view-definition-converter";
import { ViewDefinition2 } from "./view-definition-2";

export class ViewDefinitionConverter2 implements ViewDefinitionConverter<ViewDefinition2, Essence> {
  version = 2;

  fromViewDefinition(definition: ViewDefinition2, dataCube: DataCube, visualizations: Manifest[]): Essence {
    const visualization = NamedArray.findByName(visualizations, definition.visualization);
    const { isMulti, single, multi } = definition.measures;

    return new Essence({
      dataCube,
      visualizations,
      visualization,
      timezone: definition.timezone && Timezone.fromJS(definition.timezone),
      filter: Filter.fromJS(filterJSConverter(definition.filter)),
      timeShift: TimeShift.empty(),
      splits: Splits.fromJS(definition.splits),
      pinnedDimensions: OrderedSet(definition.pinnedDimensions),
      measures: createMeasures({ isMulti, single, multi: OrderedSet(multi) }),
      colors: definition.colors && Colors.fromJS(definition.colors),
      pinnedSort: dataCube.getMeasure(definition.pinnedSort) ? definition.pinnedSort : dataCube.getDefaultSortMeasure(),
      compare: null,
      highlight: definition.highlight && new Highlight(definition.highlight)
    });
  }

  toViewDefinition(essence: Essence): ViewDefinition2 {
    return essence.toJS();
  }
}

function filterJSConverter(filter: any): any {
  if (typeof filter === "string") {
    return filter;
  }

  const filterExpression = Expression.fromJSLoose(filter);
  if (filterExpression instanceof AndExpression) {
    const processedExpressions = filterExpression.getExpressionList().map(convertFilterExpression);

    return Expression.and(processedExpressions).toJS();
  } else {
    return convertFilterExpression(filterExpression).toJS();
  }
}

function convertFilterExpression(expression: Expression): Expression {
  if (expression instanceof OverlapExpression && expression.expression instanceof TimeBucketExpression) {
    const { operand: overlapOperand } = expression;
    const { operand: timeBucketOperand, duration } = expression.expression;

    return overlapOperand.overlap(timeBucketOperand.timeFloor(duration).timeRange(duration));
  } else {
    return expression;
  }
}
