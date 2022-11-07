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

export type TableConfig = VisualizationSettingsConfig<TableSettings>;

export interface TableSettings {
  collapseRows: boolean;
}

const defaults: TableSettings = {
  collapseRows: false
};

const settingsFactory = Record<TableSettings>(defaults);

const createSettings = (settings: Partial<TableSettings>): ImmutableRecord<TableSettings> => new (settingsFactory)(settings);

export const settings: TableConfig = {
  converter: {
    print: (settings: ImmutableRecord<TableSettings>) => settings.toJS(),
    read: (input: TableSettings) => createSettings({ collapseRows: !!input.collapseRows })
  },
  defaults: createSettings({}) as ImmutableRecord<object>
};
