/*
 * Copyright 2017-2022 Allegro.pl
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

import { Record } from "immutable";
import { VisualizationSettingsConfig } from "../../models/visualization-settings/visualization-settings";
import { ImmutableRecord } from "../../utils/immutable-utils/immutable-utils";

export type ScatterplotVisualizationSettings = VisualizationSettingsConfig<ScatterplotSettings>;

export interface ScatterplotSettings {
  showSummary: boolean;
}

const defaults: ScatterplotSettings = {
  showSummary: false
};

const createSettings = (settings: Partial<ScatterplotSettings>): ImmutableRecord<ScatterplotSettings> => new (Record<ScatterplotSettings>(defaults))(settings);

export const settings: ScatterplotVisualizationSettings = {
  converter: {
    print: (settings: ImmutableRecord<ScatterplotSettings>) => settings.toJS(),
    read: (input: ScatterplotSettings) => createSettings({ showSummary: Boolean(input.showSummary) })
  },
  defaults: createSettings({}) as ImmutableRecord<object>
};
