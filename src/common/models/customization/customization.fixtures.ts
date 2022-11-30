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

import { DEFAULT_COLORS } from "../colors/colors";
import { UrlShortenerContext } from "../url-shortener/url-shortener";
import { Customization, CustomizationJS } from "./customization";

export const customization: Customization = {
  messages: {
    dataCubeNotFound: "404: Data Cube Not Found"
  },
  visualizationColors: DEFAULT_COLORS,
  cssVariables: {
    "brand-selected": "orange",
    "brand": "red",
    "button-primary-active": "blue"
  },
  customLogoSvg: "<svg></svg>",
  externalViews: [],
  headerBackground: "",
  locale: undefined,
  sentryDSN: "",
  timezones: [],
  title: "",
  urlShortener: (request: any, url: string, context: UrlShortenerContext): Promise<string> => Promise.resolve(url)
};

export const customizationJS: CustomizationJS = {

};
