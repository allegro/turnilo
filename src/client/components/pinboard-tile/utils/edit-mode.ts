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

export enum RowsMode { EDITABLE, IN_EDIT, NOT_EDITABLE }

interface EditableProps {
  id: RowsMode.EDITABLE;
  createClause: Unary<string, void>;
}

interface InEditProps {
  id: RowsMode.IN_EDIT;
  toggleValue: Unary<string, void>;
  clause: PinnableClause;
}

interface NotEditableProps {
  id: RowsMode.NOT_EDITABLE;
}

export type EditMode = EditableProps | InEditProps | NotEditableProps;
