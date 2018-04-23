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

import { OrderedSet } from "immutable";
import { Colors, DataCube, Resolution, SplitCombine, Splits } from '../../models';
import { Resolve } from '../../models/manifest/manifest';
import { Resolutions } from "./resolutions";

export interface PredicateCircumstance {
  multiMeasureMode: boolean;
  selectedMeasures: OrderedSet<string>;
  splits: Splits;
  dataCube?: DataCube;
}

export interface ActionCircumstance {
  splits?: Splits;
  dataCube?: DataCube;
  colors?: Colors;
  current?: boolean;
}

export type Circumstance = Required<ActionCircumstance & PredicateCircumstance>;
export type HandleCircumstance = (circumstance: Circumstance) => Resolve;

export type Configuration = (predicateCircumstance: PredicateCircumstance) => boolean;
export type Action = (actionCircumstance: ActionCircumstance) => Resolve;

export interface CircumstancesHandlerPredicate {
  when: (configuration: Configuration) => CircumstancesHandlerAction;
  otherwise: (action: Action) => CircumstancesHandlerComplete;
  evaluate: HandleCircumstance;
  needsAtLeastOneMeasure: () => CircumstancesHandlerPredicate;
  needsAtLeastOneSplit: (message?: String) => CircumstancesHandlerPredicate;
}

export interface CircumstancesHandlerAction {
  or: (configuration: Configuration) => CircumstancesHandlerAction;
  then: (action: Action) => CircumstancesHandlerPredicate;
}

export interface CircumstancesHandlerComplete {
  evaluate: HandleCircumstance;
}

export class Predicates {
  public static noSplits(): Configuration {
    return ({ splits }) => splits.length() === 0;
  }

  private static testKind(kind: string, selector: string): boolean {
    if (selector === '*') {
      return true;
    }

    var bareSelector = selector.replace(/^!/, '');

    // This can be enriched later, right now it's just a 1-1 match
    var result = kind === bareSelector;

    if (selector.charAt(0) === '!') {
      return !result;
    }

    return result;
  }

  public static strictCompare(selectors: string[], kinds: string[]): boolean {
    if (selectors.length !== kinds.length) return false;

    return selectors.every((selector, i) => Predicates.testKind(kinds[i], selector));
  }

  public static areExactSplitKinds = (...selectors: string[]) => {
    return ({ splits, dataCube }: PredicateCircumstance): boolean => {
      var kinds: string[] = splits.toArray().map((split: SplitCombine) => split.getDimension(dataCube.dimensions).kind);
      return Predicates.strictCompare(selectors, kinds);
    };
  }

  public static haveAtLeastSplitKinds = (...kinds: string[]) => {
    return ({ splits, dataCube }: PredicateCircumstance): boolean => {
      let getKind = (split: SplitCombine) => split.getDimension(dataCube.dimensions).kind;

      let actualKinds = splits.toArray().map(getKind);

      return kinds.every((kind) => actualKinds.indexOf(kind) > -1);
    };
  }
}

export class CircumstancesHandler implements CircumstancesHandlerPredicate, CircumstancesHandlerAction, CircumstancesHandlerComplete {
  public static empty(): CircumstancesHandlerPredicate {
    return new CircumstancesHandler();
  }

  private readonly predicates: Configuration[];
  private readonly configurations: Configuration[][];
  private readonly actions: Action[];
  private readonly otherwiseAction: Action;

  private constructor(
    predicates?: Configuration[],
    configurations?: Configuration[][],
    actions?: Action[],
    otherwiseAction?: Action
  ) {
    this.predicates = predicates || [];
    this.configurations = configurations || [];
    this.actions = actions || [];
    this.otherwiseAction = otherwiseAction;
  }

  public when(configuration: Configuration): CircumstancesHandlerAction {
    const { actions, configurations } = this;
    return new CircumstancesHandler([configuration], configurations, actions);
  }

  public or(configuration: Configuration): CircumstancesHandlerAction {
    const { actions, configurations, predicates } = this;
    return new CircumstancesHandler([...predicates, configuration], configurations, actions);
  }

  public then(action: Action): CircumstancesHandlerPredicate {
    const { actions, configurations, predicates } = this;
    return new CircumstancesHandler([], [...configurations, predicates], [...actions, action]);
  }

  public otherwise(action: Action): CircumstancesHandlerComplete {
    const { actions, configurations } = this;

    return new CircumstancesHandler([], configurations, actions, action);
  }

  public needsAtLeastOneMeasure(): CircumstancesHandlerPredicate {
    return this
      .when(({ multiMeasureMode, selectedMeasures }) => multiMeasureMode && selectedMeasures.isEmpty())
      .then(({ splits, dataCube }) => {
        const defaultMeasuresResolutions = Resolutions.defaultSelectedMeasures(dataCube);

        return Resolve.manual(
          3,
          "At least one of the measures should be selected",
          defaultMeasuresResolutions.length > 0 ? defaultMeasuresResolutions : Resolutions.firstMeasure(dataCube));
      });
  }

  public needsAtLeastOneSplit(message?: string): CircumstancesHandlerPredicate {
    return this
      .when(Predicates.noSplits())
      .then(({ splits, dataCube }) => {
        return Resolve.manual(4, message, Resolutions.someDimensions(dataCube));
      }
    );
  }

  evaluate = (circumstance: Circumstance): Resolve => {
    for (let i = 0; i < this.configurations.length; i++) {
      let confs = this.configurations[i];

      if (confs.some((c) => c(circumstance))) {
        return this.actions[i](circumstance);
      }
    }

    return this.otherwiseAction(circumstance);
  }
}
