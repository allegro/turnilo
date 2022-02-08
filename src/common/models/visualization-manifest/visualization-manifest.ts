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

import { VisualizationDependentEvaluator } from "../../utils/rules/visualization-dependent-evaluator";
import { SeriesList } from "../series-list/series-list";
import { Splits } from "../splits/splits";
import { VisualizationSettingsConfig } from "../visualization-settings/visualization-settings";

export interface Adjustment {
  series?: SeriesList;
  splits?: Splits;
}

export const HIGH_PRIORITY_ACTION = 4;
export const NORMAL_PRIORITY_ACTION = 3;
export const LOWEST_PRIORITY_ACTION = 0;

export interface Resolution {
  description: string;
  adjustment: Adjustment;
}

export class Resolve {
  static NEVER: Resolve = new Resolve(-1, "never", null, null, null);

  // static READY: Resolve;

  static compare(r1: Resolve, r2: Resolve): number {
    return r2.score - r1.score;
  }

  static automatic(score: number, adjustment: Adjustment) {
    return new Resolve(score, "automatic", adjustment, null, null);
  }

  static manual(score: number, message: string, resolutions: Resolution[]) {
    return new Resolve(score, "manual", null, message, resolutions);
  }

  static ready(score: number) {
    return new Resolve(score, "ready", null, null, null);
  }

  public score: number;
  public state: string;
  public adjustment: Adjustment;
  public message: string;
  public resolutions: Resolution[];

  constructor(score: number, state: string, adjustment: Adjustment, message: string, resolutions: Resolution[]) {
    this.score = Math.max(1, Math.min(10, score));
    this.state = state;
    this.adjustment = adjustment;
    this.message = message;
    this.resolutions = resolutions;
  }

  public toString(): string {
    return this.state;
  }

  public valueOf(): string {
    return this.state;
  }

  public isReady(): boolean {
    return this.state === "ready";
  }

  public isAutomatic(): boolean {
    return this.state === "automatic";
  }

  public isManual(): boolean {
    return this.state === "manual";
  }
}

export type Visualization = "heatmap" | "table" | "totals" | "bar-chart" | "line-chart" | "grid" | "scatterplot";

export class VisualizationManifest<T extends object = {}> {
  constructor(
    public readonly name: Visualization,
    public readonly title: string,
    public readonly evaluateRules: VisualizationDependentEvaluator,
    public readonly visualizationSettings: VisualizationSettingsConfig<T>) {
  }
}
