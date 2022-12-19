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

import { expect } from "chai";
import { NOOP_LOGGER } from "../../logger/logger";
import { fromConfig, LocaleJS, LOCALES } from "./locale";

const build = (locale: LocaleJS) => fromConfig(locale, NOOP_LOGGER);

const en_us = LOCALES["en-US"];

describe("locale", () => {
  describe("fromConfig", () => {
    it("should return default locale if passed undefined", () => {
      const locale = build(undefined);

      expect(locale).to.deep.equal(en_us);
    });

    it("should use base locale", () => {
      const locale = build({ base: "en-US", overrides: {} });

      expect(locale).to.deep.equal(en_us);
    });

    it("should return default locale if passed unrecognized base identifier", () => {
      const locale = build({ base: "foobar" } as any);

      expect(locale).to.deep.equal(en_us);
    });

    it("should use base locale and override desired fields", () => {
      const locale = build({ base: "en-US", overrides: { weekStart: 42 } });

      expect(locale).to.deep.equal({
        ...en_us,
        weekStart: 42
      });
    });
  });
});
