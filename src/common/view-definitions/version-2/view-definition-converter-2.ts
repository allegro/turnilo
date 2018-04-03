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

import { AndExpression, Expression, TimeBucketExpression } from "plywood";
import { DataCube, Essence, EssenceJS, FilterJS, Manifest } from "../../models";
import { ViewDefinitionConverter } from "../view-definition-converter";

export class ViewDefinitionConverter2 implements ViewDefinitionConverter<EssenceJS, Essence> {
  version = 2;

  fromViewDefinition(definition: EssenceJS, dataCube: DataCube, visualizations: Manifest[]): Essence {
    try {
      const preProcessedDefinition = {
        ...definition,
        filter: filterJSConverter(definition.filter)
      };

      return Essence.fromJS(preProcessedDefinition, { dataCube, visualizations });
    } catch (e) {
      return null;
    }
  }

  toViewDefinition(essence: Essence): EssenceJS {
    return essence.toJS();
  }
}

function filterJSConverter(filter: FilterJS): FilterJS {
  if (typeof filter === "string")
    return filter;

  const filterExpression = Expression.fromJSLoose(filter);
  if (filterExpression instanceof AndExpression) {
    const processedExpressions = filterExpression.getExpressionList().map(convertFilterExpression);

    return Expression.and(processedExpressions).toJS();
  } else {
    return convertFilterExpression(filterExpression).toJS();
  }
}

function convertFilterExpression(expression: Expression): Expression {
  if (expression instanceof TimeBucketExpression) {
    const { operand, duration } = expression;

    return operand.timeFloor(duration).timeRange(duration);
  } else {
    return expression;
  }
}
