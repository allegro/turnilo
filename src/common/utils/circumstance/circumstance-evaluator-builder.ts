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

import { Resolve } from '../../models/manifest/manifest';
import { ActionCircumstance, CircumstanceEvaluator, ComposedCircumstance, PredicateCircumstance } from "./circumstance-evaluator";
import { Predicates } from "./predicates";
import { Resolutions } from "./resolutions";

export type Predicate = (predicateCircumstance: PredicateCircumstance) => boolean;
export type Action = (actionCircumstance: ActionCircumstance) => Resolve;

type PartialRule = { predicates: Predicate[] };
type Rule = PartialRule & { action: Action };

export interface CircumstanceEvaluatorBuilderEmpty {
  when: (configuration: Predicate) => CircumstanceEvaluatorBuilderWithPartialRule;
  needsAtLeastOneMeasure: () => CircumstanceEvaluatorBuilderWithRule;
  needsAtLeastOneSplit: (message?: String) => CircumstanceEvaluatorBuilderWithRule;
}

export interface CircumstanceEvaluatorBuilderWithRule extends CircumstanceEvaluatorBuilderEmpty, CircumstanceEvaluatorBuilderComplete {
  otherwise: (action: Action) => CircumstanceEvaluatorBuilderComplete;
}

export interface CircumstanceEvaluatorBuilderWithPartialRule {
  or: (configuration: Predicate) => CircumstanceEvaluatorBuilderWithPartialRule;
  then: (action: Action) => CircumstanceEvaluatorBuilderWithRule;
}

export interface CircumstanceEvaluatorBuilderComplete {
  build: () => CircumstanceEvaluator;
}

export class CircumstanceEvaluatorBuilder
  implements
    CircumstanceEvaluatorBuilderWithRule,
    CircumstanceEvaluatorBuilderWithPartialRule,
    CircumstanceEvaluatorBuilderComplete {

  public static empty(): CircumstanceEvaluatorBuilderEmpty {
    return new CircumstanceEvaluatorBuilder();
  }

  private readonly rules: Rule[];
  private readonly partialRule: PartialRule | undefined;
  private readonly otherwiseAction: Action;

  private constructor(rules?: Rule[], partialRule?: PartialRule, otherwiseAction?: Action) {
    this.partialRule = partialRule;
    this.otherwiseAction = otherwiseAction;
    this.rules = rules || [];
  }

  public when(predicate: Predicate): CircumstanceEvaluatorBuilderWithPartialRule {
    const { rules } = this;
    const partialRule = { predicates: [predicate] };

    return new CircumstanceEvaluatorBuilder(rules, partialRule);
  }

  public or(predicate: Predicate): CircumstanceEvaluatorBuilderWithPartialRule {
    const { rules, partialRule } = this;
    const newPartialRule = { predicates: [...partialRule.predicates, predicate] };

    return new CircumstanceEvaluatorBuilder(rules, newPartialRule);
  }

  public then(action: Action): CircumstanceEvaluatorBuilderWithRule {
    const { rules, partialRule } = this;
    const newRule = { ...partialRule, action };
    return new CircumstanceEvaluatorBuilder([...rules, newRule]);
  }

  public otherwise(action: Action): CircumstanceEvaluatorBuilderComplete {
    const { rules } = this;

    return new CircumstanceEvaluatorBuilder(rules, undefined, action);
  }

  public needsAtLeastOneMeasure(): CircumstanceEvaluatorBuilderWithRule {
    return this
      .when(({ multiMeasureMode, selectedMeasures }) => multiMeasureMode && selectedMeasures.isEmpty())
      .then(({ splits, dataCube }) => {
        const selectDefault = Resolutions.defaultSelectedMeasures(dataCube);
        const resolutions = selectDefault.length > 0 ? selectDefault : Resolutions.firstMeasure(dataCube);

        return Resolve.manual(3, "At least one of the measures should be selected", resolutions);
      });
  }

  public needsAtLeastOneSplit(message?: string): CircumstanceEvaluatorBuilderWithRule {
    return this
      .when(Predicates.noSplits())
      .then(({ splits, dataCube }) => {
          return Resolve.manual(4, message, Resolutions.someDimensions(dataCube));
        }
      );
  }

  public build(): CircumstanceEvaluator {
    return (circumstance: ComposedCircumstance): Resolve => {
      for (let rule of this.rules) {
        const { predicates, action } = rule;
        if (predicates.some((predicate) => predicate(circumstance))) {
          return action(circumstance);
        }
      }

      return this.otherwiseAction(circumstance);
    };
  }
}
