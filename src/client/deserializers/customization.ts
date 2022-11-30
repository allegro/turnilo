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

import { Timezone } from "chronoshift";
import { ClientCustomization, SerializedCustomization } from "../../common/models/customization/customization";
import { deserialize as deserializeLocale } from "../../common/models/locale/locale";

export function deserialize(customization: SerializedCustomization): ClientCustomization {
  const { headerBackground, messages, locale, customLogoSvg, timezones, externalViews, hasUrlShortener, sentryDSN, visualizationColors } = customization;
  return {
    headerBackground,
    customLogoSvg,
    externalViews,
    hasUrlShortener,
    sentryDSN,
    messages,
    locale: deserializeLocale(locale),
    timezones: timezones.map(Timezone.fromJS),
    visualizationColors
  };
}
