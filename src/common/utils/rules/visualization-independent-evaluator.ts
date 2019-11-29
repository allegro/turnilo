/*
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

import { DataCube } from "../../models/data-cube/data-cube";
import { SeriesList } from "../../models/series-list/series-list";
import { Actions } from "./actions";
import { Predicates } from "./predicates";
import { RulesEvaluator } from "./rules-evaluator";
import { Action, Predicate, RulesEvaluatorBuilder } from "./rules-evaluator-builder";

export interface PredicateVariables {
  series: SeriesList;
}

export interface ActionVariables {
  dataCube: DataCube;
}

export type VisualizationIndependentPredicate = Predicate<PredicateVariables>;
export type VisualizationIndependentAction = Action<ActionVariables>;

export type VisualizationIndependentEvaluator = RulesEvaluator<PredicateVariables, ActionVariables>;

export const visualizationIndependentEvaluator: VisualizationIndependentEvaluator =
  RulesEvaluatorBuilder.empty()
    .when(Predicates.noSelectedMeasures())
    .then(Actions.manualMeasuresSelection())
    .otherwise(Actions.ready())
    .build();
