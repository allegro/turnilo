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

import { Unary } from "../../../../common/utils/functional/functional";
import { PinnableClause } from "./pinnable-clause";

export enum RowModeId { READONLY, EDITABLE }

export interface ReadonlyMode {
  mode: RowModeId.READONLY;
}

export enum EditState { READY, IN_EDIT }

export interface InEditMode  {
  mode: RowModeId.EDITABLE;
  state: EditState.IN_EDIT;
  toggleValue: Unary<string, void>;
  clause: PinnableClause;
}

export interface ReadyToEditMode {
  mode: RowModeId.EDITABLE;
  state: EditState.READY;
  createClause: Unary<string, void>;
}

export type RowMode = ReadonlyMode | InEditMode | ReadyToEditMode;
