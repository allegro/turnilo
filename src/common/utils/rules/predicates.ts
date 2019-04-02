/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import { Split } from "../../models/split/split";
import { VisualizationDependentPredicate } from "./visualization-dependent-evaluator";
import { VisualizationIndependentPredicate } from "./visualization-independent-evaluator";

export class Predicates {
  public static noSplits(): VisualizationDependentPredicate {
    return Predicates.numberOfSplitsIs(0);
  }

  public static numberOfSplitsIs(expected: number): VisualizationDependentPredicate {
    return ({ splits }) => splits.length() === expected;
  }

  public static areExactSplitKinds(...selectors: string[]): VisualizationDependentPredicate {
    return ({ splits, dataCube }) => {
      const kinds: string[] = splits.splits.map((split: Split) => dataCube.getDimension(split.reference).kind).toArray();
      return Predicates.strictCompare(selectors, kinds);
    };
  }

  public static strictCompare(selectors: string[], kinds: string[]): boolean {
    if (selectors.length !== kinds.length) return false;

    return selectors.every((selector, i) => Predicates.testKind(kinds[i], selector));
  }

  private static testKind(kind: string, selector: string): boolean {
    if (selector === "*") {
      return true;
    }

    var bareSelector = selector.replace(/^!/, "");

    // This can be enriched later, right now it's just a 1-1 match
    var result = kind === bareSelector;

    if (selector.charAt(0) === "!") {
      return !result;
    }

    return result;
  }

  public static haveAtLeastSplitKinds(...kinds: string[]): VisualizationDependentPredicate {
    return ({ splits, dataCube }) => {
      let getKind = (split: Split) => dataCube.getDimension(split.reference).kind;

      const actualKinds = splits.splits.map(getKind);

      return kinds.every(kind => actualKinds.indexOf(kind) > -1);
    };
  }

  public static supportedSplitsCount(): VisualizationDependentPredicate {
    return ({ splits, dataCube }) => dataCube.getMaxSplits() < splits.length();
  }

  public static noSelectedMeasures(): VisualizationIndependentPredicate {
    return ({ series }) => {
      return series.count() === 0;
    };
  }
}
