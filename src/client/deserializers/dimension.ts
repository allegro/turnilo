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

import { Duration } from "chronoshift";
import { Expression } from "plywood";
import { bucketingStrategies, ClientDimension, SerializedDimension } from "../../common/models/dimension/dimension";
import { TimeShift } from "../../common/models/time-shift/time-shift";

export function deserialize(dimension: SerializedDimension): ClientDimension {
  const { description, url, name, title, expression, limits, sortStrategy } = dimension;

  switch (dimension.kind) {
    case "string": {
      return {
        kind: dimension.kind,
        description,
        url,
        name,
        title,
        limits,
        sortStrategy,
        expression: Expression.fromJS(expression),
        multiValue: dimension.multiValue
      };
    }
    case "boolean":
      return {
        kind: dimension.kind,
        description,
        url,
        name,
        title,
        limits,
        sortStrategy,
        expression: Expression.fromJS(expression)
      };
    case "number": {
      const { bucketedBy, bucketingStrategy, granularities } = dimension;
      return {
        kind: dimension.kind,
        description,
        url,
        name,
        title,
        limits,
        sortStrategy,
        expression: Expression.fromJS(expression),
        granularities,
        bucketedBy,
        bucketingStrategy: bucketingStrategy && bucketingStrategies[bucketingStrategy]
      };
    }
    case "time": {
      const { bucketedBy, bucketingStrategy, granularities, timeShiftDurations, latestPeriodDurations } = dimension;
      return {
        kind: dimension.kind,
        description,
        url,
        name,
        title,
        limits,
        sortStrategy,
        expression: Expression.fromJS(expression),
        bucketedBy: bucketedBy && Duration.fromJS(bucketedBy),
        bucketingStrategy: bucketingStrategy && bucketingStrategies[bucketingStrategy],
        granularities: granularities && granularities.map(Duration.fromJS),
        timeShiftDurations: timeShiftDurations.map(TimeShift.fromJS),
        latestPeriodDurations: latestPeriodDurations.map(Duration.fromJS)
      };
    }
  }
}
