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

import { Datum } from "plywood";
import { safeEquals } from "../../../../../common/utils/immutable-utils/immutable-utils";

enum InteractionKind { HOVER, HIGHLIGHT }

interface InteractionBase {
  kind: InteractionKind;
  datum: Datum;
  key: string;
}

export interface Hover extends InteractionBase {
  kind: InteractionKind.HOVER;
}

export const createHover = (key: string, datum: Datum): Hover => ({
  kind: InteractionKind.HOVER,
  datum,
  key
});

export const isHover = (interaction?: Interaction): interaction is Hover => interaction && interaction.kind === InteractionKind.HOVER;

export interface Highlight extends InteractionBase {
  kind: InteractionKind.HIGHLIGHT;
}

export const createHighlight = (key: string, datum: Datum): Highlight => ({
  kind: InteractionKind.HIGHLIGHT,
  datum,
  key
});

export const isHighlight = (interaction?: Interaction): interaction is Highlight => interaction && interaction.kind === InteractionKind.HIGHLIGHT;

export type Interaction = Hover | Highlight;

export function equalInteractions(a: Interaction, b: Interaction): boolean {
  return a.kind === b.kind
    && a.key === b.key
    && safeEquals(a.datum, b.datum);
}
