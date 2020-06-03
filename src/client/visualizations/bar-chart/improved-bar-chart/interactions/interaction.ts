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

import { FilterClause } from "../../../../../common/models/filter-clause/filter-clause";
import { Highlight as VizHighlight } from "../../../base-visualization/highlight";
import { DomainValue } from "../utils/x-domain";

enum InteractionKind { HOVER, HIGHLIGHT }

interface InteractionBase {
  kind: InteractionKind;
  key: string;
}

export interface Hover extends InteractionBase {
  kind: InteractionKind.HOVER;
  value: DomainValue;
}

export const createHover = (key: string, value: DomainValue): Hover => ({
  kind: InteractionKind.HOVER,
  value,
  key
});

export const isHover = (interaction?: Interaction): interaction is Hover => interaction && interaction.kind === InteractionKind.HOVER;

export interface Highlight extends InteractionBase {
  kind: InteractionKind.HIGHLIGHT;
  clause: FilterClause;
}

export const createHighlight = (highlight: VizHighlight): Highlight => ({
  kind: InteractionKind.HIGHLIGHT,
  clause: highlight.clauses.first(),
  key: highlight.key
});

export const isHighlight = (interaction?: Interaction): interaction is Highlight => interaction && interaction.kind === InteractionKind.HIGHLIGHT;

export type Interaction = Hover  | Highlight;
