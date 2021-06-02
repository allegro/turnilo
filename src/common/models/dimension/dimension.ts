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

import { Duration } from "chronoshift";
import { $, Expression, ExpressionJS, RefExpression } from "plywood";
import {
  DEFAULT_LATEST_PERIOD_DURATIONS,
  DEFAULT_TIME_SHIFT_DURATIONS
} from "../../../client/components/filter-menu/time-filter-menu/presets";
import { makeTitle, verifyUrlSafeName } from "../../utils/general/general";
import { GranularityJS } from "../granularity/granularity";
import { Bucket } from "../split/split";
import { TimeShift, TimeShiftJS } from "../time-shift/time-shift";

const DEFAULT_TIME_SHIFTS = DEFAULT_TIME_SHIFT_DURATIONS.map(TimeShift.fromJS);
const DEFAULT_LATEST_PERIODS = DEFAULT_LATEST_PERIOD_DURATIONS.map(Duration.fromJS);

export type DimensionKind = "string" | "boolean" | "time" | "number";

interface BaseDimension {
  kind: DimensionKind;
  name: string;
  title: string;
  description?: string;
  expression: Expression;
  url?: string;
  sortStrategy?: string;
}

export interface StringDimension extends BaseDimension {
  kind: "string";
  multiValue: boolean;
}

export interface BooleanDimension extends BaseDimension {
  kind: "boolean";
}

export interface TimeDimension extends BaseDimension {
  kind: "time";
  granularities?: Duration[];
  bucketedBy?: Duration;
  bucketingStrategy?: BucketingStrategy;
  timeShiftDurations: TimeShift[];
  latestPeriodDurations: Duration[];
}

export interface NumberDimension extends BaseDimension {
  kind: "number";
  granularities?: number[];
  bucketedBy?: number;
  bucketingStrategy?: BucketingStrategy;
}

export type Dimension = StringDimension | BooleanDimension | TimeDimension | NumberDimension;

function readKind(kind: string): DimensionKind {
  if (kind === "string" || kind === "boolean" || kind === "time" || kind === "number") return kind;
  throw new Error(`Unrecognized kind: ${kind}`);
}

function typeToKind(type: string): DimensionKind {
  if (!type) return "string";
  return readKind(type.toLowerCase().replace(/_/g, "-").replace(/-range$/, ""));
}

export enum BucketingStrategy {
  defaultBucket = "defaultBucket",
  defaultNoBucket = "defaultNoBucket"
}

export const bucketingStrategies: { [strategy in BucketingStrategy]: BucketingStrategy } = {
  defaultBucket: BucketingStrategy.defaultBucket,
  defaultNoBucket: BucketingStrategy.defaultNoBucket
};

export interface DimensionJS {
  name: string;
  title?: string;
  description?: string;
  formula?: string;
  kind?: string;
  multiValue?: boolean;
  url?: string;
  granularities?: GranularityJS[];
  timeShiftDurations?: string[];
  latestPeriodDurations?: string[];
  bucketedBy?: GranularityJS;
  bucketingStrategy?: BucketingStrategy;
  sortStrategy?: string;
}

interface LegacyDimension {
  expression?: any;
  type?: string;
}

function readExpression(config: DimensionJS & LegacyDimension): Expression {
  if (config.formula) return Expression.parse(config.formula);
  if (config.expression) return Expression.parse(config.expression);
  return $(config.name);
}

export function fromConfig(config: DimensionJS & LegacyDimension): Dimension {
  const { kind: rawKind, description, name, title: rawTitle, url, sortStrategy } = config;
  verifyUrlSafeName(name);
  const kind = rawKind ? readKind(rawKind) : typeToKind(config.type);
  const expression = readExpression(config);
  const title = rawTitle || makeTitle(name);
  switch (kind) {
    case "string": {
      const { multiValue } = config;
      return {
        description,
        url,
        name,
        title,
        expression,
        multiValue: Boolean(multiValue),
        sortStrategy,
        kind
      };
    }
    case "boolean":
      return {
        description,
        url,
        name,
        title,
        expression,
        sortStrategy,
        kind
      };
    case "time": {
      const {
        bucketedBy,
        bucketingStrategy
      } = config;

      return {
        kind,
        name,
        sortStrategy,
        title,
        url,
        description,
        expression,
        bucketedBy: bucketedBy && Duration.fromJS(bucketedBy as string),
        bucketingStrategy: bucketingStrategy && bucketingStrategies[bucketingStrategy],
        granularities: readGranularities(config, "time"),
        latestPeriodDurations: readLatestPeriodDurations(config),
        timeShiftDurations: readTimeShiftDurations(config)
      };
    }
    case "number": {
      const {
        bucketedBy,
        bucketingStrategy
      } = config;

      return {
        kind,
        name,
        sortStrategy,
        title,
        url,
        description,
        expression,
        bucketedBy: bucketedBy && Number(bucketedBy),
        bucketingStrategy: bucketingStrategy && bucketingStrategies[bucketingStrategy],
        granularities: readGranularities(config, "number")
      };
    }
  }
}

function readLatestPeriodDurations({ name, latestPeriodDurations }: DimensionJS): Duration[] {
  if (!latestPeriodDurations) return DEFAULT_LATEST_PERIODS;
  if (!Array.isArray(latestPeriodDurations) || latestPeriodDurations.length !== 5) {
    throw new Error(`must have list of 5 latestPeriodDurations in dimension '${name}'`);
  }
  return latestPeriodDurations.map(Duration.fromJS);
}

function readTimeShiftDurations({ name, timeShiftDurations }: DimensionJS): TimeShift[] {
  if (!timeShiftDurations) return DEFAULT_TIME_SHIFTS;
  if (!Array.isArray(timeShiftDurations) || timeShiftDurations.length !== 4) {
    throw new Error(`must have list of 4 timeShiftDurations in dimension '${name}'`);
  }
  return timeShiftDurations.map(TimeShift.fromJS);
}

function readGranularities(config: DimensionJS, kind: "time"): Duration[] | undefined;
function readGranularities(config: DimensionJS, kind: "number"): number[] | undefined;
function readGranularities(config: DimensionJS, kind: "number" | "time"): Bucket[] | undefined {
  const { granularities } = config;
  if (!granularities) return undefined;
  if (!Array.isArray(granularities) || granularities.length !== 5) {
    throw new Error(`must have list of 5 granularities in dimension '${config.name}'`);
  }
  switch (kind) {
    case "number":
      return granularities.map(g => Number(g));
    case "time":
      return granularities.map(g => Duration.fromJS(g as string));
  }
}

interface SerializedStringDimension {
  kind: "string";
  name: string;
  title: string;
  description?: string;
  expression: ExpressionJS;
  url?: string;
  sortStrategy?: string;
  multiValue: boolean;
}

interface SerializedBooleanDimension {
  kind: "boolean";
  name: string;
  title: string;
  description?: string;
  expression: ExpressionJS;
  url?: string;
  sortStrategy?: string;
}

interface SerializedNumberDimension {
  kind: "number";
  name: string;
  title: string;
  description?: string;
  expression: ExpressionJS;
  url?: string;
  sortStrategy?: string;
  granularities?: number[];
  bucketedBy?: number;
  bucketingStrategy?: BucketingStrategy;
}

interface SerializedTimeDimension {
  kind: "time";
  name: string;
  title: string;
  description?: string;
  expression: ExpressionJS;
  url?: string;
  sortStrategy?: string;
  granularities?: string[];
  bucketedBy?: string;
  bucketingStrategy?: BucketingStrategy;
  timeShiftDurations: TimeShiftJS[];
  latestPeriodDurations: string[];
}

export type SerializedDimension =
  SerializedStringDimension
  | SerializedBooleanDimension
  | SerializedNumberDimension
  | SerializedTimeDimension;

export function serialize(dimension: Dimension): SerializedDimension {
  const { name, description, expression, title, sortStrategy, url } = dimension;

  // NOTE: If we move kind to destructuring above, typescript would not infer proper Dimension variant
  switch (dimension.kind) {
    case "string": {
      const { multiValue } = dimension;
      return {
        description,
        url,
        name,
        title,
        expression: expression.toJS(),
        multiValue,
        sortStrategy,
        kind: dimension.kind
      };
    }
    case "boolean":
      return {
        description,
        url,
        name,
        title,
        expression: expression.toJS(),
        sortStrategy,
        kind: dimension.kind
      };
    case "time": {
      const { granularities, bucketedBy, bucketingStrategy, latestPeriodDurations, timeShiftDurations } = dimension;
      return {
        description,
        url,
        name,
        title,
        expression: expression.toJS(),
        sortStrategy,
        bucketingStrategy,
        bucketedBy: bucketedBy && bucketedBy.toJS(),
        granularities: granularities && granularities.map(g => g.toJS()),
        latestPeriodDurations: latestPeriodDurations.map(p => p.toJS()),
        timeShiftDurations: timeShiftDurations.map(ts => ts.toJS()),
        kind: dimension.kind
      };
    }
    case "number": {
      const { granularities, bucketedBy, bucketingStrategy } = dimension;
      return {
        description,
        url,
        name,
        title,
        expression: expression.toJS(),
        sortStrategy,
        bucketingStrategy,
        bucketedBy,
        granularities,
        kind: dimension.kind
      };
    }
  }
}

export type ClientDimension = Dimension;

export function canBucketByDefault(dimension: ClientDimension): boolean {
  return isContinuous(dimension) && dimension.bucketingStrategy !== BucketingStrategy.defaultNoBucket;
}

export function isContinuous(dimension: ClientDimension): dimension is TimeDimension | NumberDimension  {
  const { kind } = dimension;
  return kind === "time" || kind === "number";
}

export function createDimension(kind: DimensionKind, name: string, expression: Expression, multiValue?: boolean): Dimension {
  switch (kind) {
    case "string":
      return {
        kind,
        name,
        title: makeTitle(name),
        expression,
        multiValue: Boolean(multiValue)
      };
    case "boolean":
      return {
        kind,
        name,
        title: makeTitle(name),
        expression
      };
    case "time":
      return {
        latestPeriodDurations: DEFAULT_LATEST_PERIODS,
        timeShiftDurations: DEFAULT_TIME_SHIFTS,
        kind,
        name,
        title: makeTitle(name),
        expression
      };
    case "number":
      return {
        kind,
        name,
        title: makeTitle(name),
        expression
      };
  }
}

export function timeDimension(timeAttribute: RefExpression): Dimension {
  return createDimension("time", "time", timeAttribute);
}
