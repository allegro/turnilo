/*
 * Copyright 2017-2021 Allegro.pl
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

import { ClientAppSettings, SerializedAppSettings } from "../../common/models/app-settings/app-settings";
import { deserialize as deserializeCustomization } from "./customization";
import { deserialize as deserializeOauth } from "./oauth";

export function deserialize({ oauth, clientTimeout, customization, version }: SerializedAppSettings): ClientAppSettings {
  return {
    clientTimeout,
    version,
    customization: deserializeCustomization(customization),
    oauth: deserializeOauth(oauth)
  };
}

/*
 NOTE: Function is used only for serialize-deserialize cycle in Essence class.
 Now it's hard to remove that functionality but in the end, Essence does not need to serialize itself.
*/
export function serialize(appSettings: ClientAppSettings): SerializedAppSettings {
  const { clientTimeout, version, customization, oauth } = appSettings;
  const { visualizationColors, messages, customLogoSvg, hasUrlShortener, locale, headerBackground, sentryDSN, timezones, externalViews } = customization;

  return {
    clientTimeout,
    version,
    oauth,
    customization: {
      visualizationColors,
      messages,
      customLogoSvg,
      locale,
      hasUrlShortener,
      headerBackground,
      sentryDSN,
      timezones: timezones.map(t => t.toJS()),
      externalViews
    }
  };
}
