/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2019 Allegro.pl
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
import { LOGGER } from "../../logger/logger";
import { isTruthy } from "../../utils/general/general";
import { ExternalView, ExternalViewValue } from "../external-view/external-view";
import { deserialize as localeDeserialize, fromConfig as localeFromConfig, Locale, LocaleJS, serialize as localeSerialize } from "../locale/locale";
import { fromConfig as urlShortenerFromConfig, UrlShortener, UrlShortenerDef } from "../url-shortener/url-shortener";

const DEFAULT_TITLE = "Turnilo (%v)";

const DEFAULT_TIMEZONES: Timezone[] = [
  new Timezone("America/Juneau"), // -9.0
  new Timezone("America/Los_Angeles"), // -8.0
  new Timezone("America/Yellowknife"), // -7.0
  new Timezone("America/Phoenix"), // -7.0
  new Timezone("America/Denver"), // -7.0
  new Timezone("America/Mexico_City"), // -6.0
  new Timezone("America/Chicago"), // -6.0
  new Timezone("America/New_York"), // -5.0
  new Timezone("America/Argentina/Buenos_Aires"), // -4.0
  Timezone.UTC,
  new Timezone("Asia/Jerusalem"), // +2.0
  new Timezone("Europe/Paris"), // +1.0
  new Timezone("Asia/Kathmandu"), // +5.8
  new Timezone("Asia/Hong_Kong"), // +8.0
  new Timezone("Asia/Seoul"), // +9.0
  new Timezone("Pacific/Guam") // +10.0
];

const availableCssVariables = [
  "background-base",
  "background-brand-light",
  "background-brand-text",
  "background-brand",
  "background-dark",
  "background-light",
  "background-lighter",
  "background-lightest",
  "background-medium",
  "border-darker",
  "border-extra-light",
  "border-light",
  "border-medium",
  "border-super-light",
  "brand-hover",
  "brand-selected",
  "brand",
  "button-primary-active",
  "button-primary-hover",
  "button-secondary-active",
  "button-secondary-hover",
  "button-secondary",
  "button-warn-active",
  "button-warn-hover",
  "button-warn",
  "danger",
  "dark",
  "date-range-picker-selected",
  "drop-area-indicator",
  "error",
  "grid-line-color",
  "highlight-border",
  "highlight",
  "hover",
  "icon-hover",
  "icon-light",
  "item-dimension-hover",
  "item-dimension-text",
  "item-dimension",
  "item-measure-hover",
  "item-measure-text",
  "item-measure",
  "main-time-area",
  "main-time-line",
  "negative",
  "pinboard-icon",
  "positive",
  "text-default-color",
  "text-light",
  "text-lighter",
  "text-lighterish",
  "text-lightest",
  "text-link",
  "text-medium",
  "text-standard"
];

export interface Customization {
  title?: string;
  headerBackground?: string;
  customLogoSvg?: string;
  externalViews: ExternalView[];
  timezones: Timezone[];
  urlShortener?: UrlShortener;
  sentryDSN?: string;
  cssVariables: Record<string, string>;
  locale: Locale;
}

export interface CustomizationJS {
  title?: string;
  locale?: LocaleJS;
  headerBackground?: string;
  customLogoSvg?: string;
  externalViews?: ExternalViewValue[];
  timezones?: string[];
  urlShortener?: UrlShortenerDef;
  sentryDSN?: string;
  cssVariables?: Record<string, string>;
}

export interface SerializedCustomization {
  headerBackground?: string;
  customLogoSvg?: string;
  timezones: string[];
  externalViews: ExternalViewValue[];
  hasUrlShortener: boolean;
  sentryDSN?: string;
  locale: Locale;
}

export interface ClientCustomization {
  headerBackground?: string;
  customLogoSvg?: string;
  timezones: Timezone[];
  externalViews: ExternalViewValue[];
  hasUrlShortener: boolean;
  sentryDSN?: string;
  locale: Locale;
}

function validate({ cssVariables }: Customization): boolean {
  let valid = true;

  Object.keys(cssVariables).forEach(variableName => {
    if (availableCssVariables.indexOf(variableName) < 0) {
      valid = false;
      LOGGER.warn(`Unsupported css variables "${variableName}" found.`);
    }
  });

  return valid;
}

export function fromConfig(config: CustomizationJS = {}): Customization {
  const {
    title = DEFAULT_TITLE,
    headerBackground,
    customLogoSvg,
    externalViews: configExternalViews,
    timezones: configTimezones,
    urlShortener,
    sentryDSN,
    cssVariables = {},
    locale
  } = config;

  const timezones = Array.isArray(configTimezones)
    ? configTimezones.map(Timezone.fromJS)
    : DEFAULT_TIMEZONES;

  const externalViews = Array.isArray(configExternalViews)
    ? configExternalViews.map(ExternalView.fromJS)
    : [];

  const customization = {
    title,
    headerBackground,
    customLogoSvg,
    sentryDSN,
    cssVariables,
    urlShortener: urlShortenerFromConfig(urlShortener),
    timezones,
    locale: localeFromConfig(locale),
    externalViews
  };

  // TODO: Fallthrough, because we don't have any mechanism for handling incorrect configs
  validate(customization);

  return customization;
}

export function serialize(customization: Customization): SerializedCustomization {
  const { customLogoSvg, timezones, headerBackground, locale, externalViews, sentryDSN, urlShortener } = customization;
  return {
    customLogoSvg,
    externalViews,
    hasUrlShortener: isTruthy(urlShortener),
    headerBackground,
    sentryDSN,
    locale: localeSerialize(locale),
    timezones: timezones.map(t => t.toJS())
  };
}

export function getTitle({ title }: Customization, version: string): string {
  return title.replace(/%v/g, version);
}
