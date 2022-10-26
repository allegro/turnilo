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

import { Record } from "immutable";
import { VisualizationSettingsConfig } from "../../models/visualization-settings/visualization-settings";
import { ImmutableRecord } from "../../utils/immutable-utils/immutable-utils";

export type LineChartVisualizationSettings = VisualizationSettingsConfig<LineChartSettings>;

export interface LineChartSettings {
  groupSeries: boolean;
}

const defaults: LineChartSettings = {
  groupSeries: false
};

const settingsFactory = Record<LineChartSettings>(defaults);

const createSettings = (settings: Partial<LineChartSettings>): ImmutableRecord<LineChartSettings> => new (settingsFactory)(settings);

export const settings: LineChartVisualizationSettings = {
  converter: {
    print: (settings: ImmutableRecord<LineChartSettings>) => settings.toJS(),
    read: (input: LineChartSettings) => createSettings({ groupSeries: !!input.groupSeries })
  },
  defaults: createSettings({}) as ImmutableRecord<object>
};
