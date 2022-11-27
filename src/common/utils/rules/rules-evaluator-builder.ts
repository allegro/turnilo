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

import { Resolve } from "../../models/visualization-manifest/visualization-manifest";
import { RulesEvaluator } from "./rules-evaluator";

export type Predicate<Variables> = (predicateVariables: Variables) => boolean;
export type Action<Variables> = (actionVariables: Variables) => Resolve;

export interface RulesEvaluatorBuilderEmpty<PredicateVars, ActionVars> {
  when(predicate: Predicate<PredicateVars>): RulesEvaluatorBuilderWithPartialRule<PredicateVars, ActionVars>;
}

export interface RulesEvaluatorBuilderWithRule<PredicateVars, ActionVars>
  extends RulesEvaluatorBuilderEmpty<PredicateVars, ActionVars> {
  otherwise(action: Action<ActionVars>): RulesEvaluatorBuilderComplete<PredicateVars, ActionVars>;
}

export interface RulesEvaluatorBuilderWithPartialRule<PredicateVars, ActionVars> {
  or(predicate: Predicate<PredicateVars>): RulesEvaluatorBuilderWithPartialRule<PredicateVars, ActionVars>;

  then(action: Action<ActionVars>): RulesEvaluatorBuilderWithRule<PredicateVars, ActionVars>;
}

export interface RulesEvaluatorBuilderComplete<PredicateVars, ActionVars> {
  build(): RulesEvaluator<PredicateVars, ActionVars>;
}

interface PartialRule<PredicateVars> {
  predicates: Array<Predicate<PredicateVars>>;
}

type Rule<PredicateVars, ActionVars> = PartialRule<PredicateVars> & { action: Action<ActionVars> };

export class RulesEvaluatorBuilder<PredicateVars, ActionVars>
  implements RulesEvaluatorBuilderWithRule<PredicateVars, ActionVars>,
    RulesEvaluatorBuilderWithPartialRule<PredicateVars, ActionVars>,
    RulesEvaluatorBuilderComplete<PredicateVars, ActionVars> {

  static empty<PredicateVars, ActionVars>(): RulesEvaluatorBuilderEmpty<PredicateVars, ActionVars> {
    return new RulesEvaluatorBuilder();
  }

  private readonly rules: Array<Rule<PredicateVars, ActionVars>>;
  private readonly partialRule?: PartialRule<PredicateVars>;
  private readonly otherwiseAction: Action<ActionVars>;

  private constructor(rules?: Array<Rule<PredicateVars, ActionVars>>, partialRule?: PartialRule<PredicateVars>, otherwiseAction?: Action<ActionVars>) {
    this.partialRule = partialRule;
    this.otherwiseAction = otherwiseAction;
    this.rules = rules || [];
  }

  when(predicate: Predicate<PredicateVars>): RulesEvaluatorBuilderWithPartialRule<PredicateVars, ActionVars> {
    const { rules } = this;
    const partialRule = { predicates: [predicate] };

    return new RulesEvaluatorBuilder(rules, partialRule);
  }

  or(predicate: Predicate<PredicateVars>): RulesEvaluatorBuilderWithPartialRule<PredicateVars, ActionVars> {
    const { rules, partialRule } = this;
    const newPartialRule = { predicates: [...partialRule.predicates, predicate] };

    return new RulesEvaluatorBuilder(rules, newPartialRule);
  }

  then(action: Action<ActionVars>): RulesEvaluatorBuilderWithRule<PredicateVars, ActionVars> {
    const { rules, partialRule } = this;
    const newRule = { ...partialRule, action };
    return new RulesEvaluatorBuilder([...rules, newRule]);
  }

  otherwise(action: Action<ActionVars>): RulesEvaluatorBuilderComplete<PredicateVars, ActionVars> {
    const { rules } = this;

    return new RulesEvaluatorBuilder(rules, undefined, action);
  }

  build(): RulesEvaluator<PredicateVars, ActionVars> {
    return (variables: PredicateVars & ActionVars): Resolve => {
      for (const rule of this.rules) {
        const { predicates, action } = rule;
        if (predicates.some(predicate => predicate(variables))) {
          return action(variables);
        }
      }

      return this.otherwiseAction(variables);
    };
  }
}
