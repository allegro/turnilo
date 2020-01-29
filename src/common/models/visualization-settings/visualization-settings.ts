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

import * as React from "react";
import { Unary } from "../../utils/functional/functional";

interface VisualizationSettingsComponentProps<T> {
  onChange: Unary<T, void>;
}

export type VisualizationSettingsComponent<T> = React.SFC<VisualizationSettingsComponentProps<T> & T>;

interface VisualizationSettingsConverter<T> {
  print: Unary<T, object>;
  read: Unary<unknown, T>;
}

export interface VisualizationSettings<T> {
  component: VisualizationSettingsComponent<T>;
  converter: VisualizationSettingsConverter<T>;
  defaults: T;
}
