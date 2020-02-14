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

import { expect } from "chai";
import { Record } from "immutable";
import { ImmutableRecord } from "../../utils/immutable-utils/immutable-utils";
import { settings, TableSettings } from "./settings";

describe("TableSettings", () => {
  describe("defaults", () => {
    const defaults = settings.defaults as ImmutableRecord<TableSettings>;

    it("should create record", () => {
      expect(defaults).to.be.instanceOf(Record);
    });

    it("should have collapseRows prop", () => {
      expect(defaults.has("collapseRows")).to.be.true;
    });

    it("should have collapseRows value to be false", () => {
      expect(defaults.get("collapseRows", null)).to.be.false;
    });
  });

  describe("defaults", () => {
    const { print, read } = settings.converter;
    const makeSettings = (collapseRows: boolean) =>
      new (Record<TableSettings>({ collapseRows: false }))({ collapseRows });

    describe("print", () => {
      it("should print settings as object", () => {
        expect(print(makeSettings(true))).to.deep.equal({ collapseRows: true });
      });
    });

    describe("read", () => {
      describe("should read settings as immutable record", () => {
        const record = read({ collapseRows: true });

        it("should read record", () => {
          expect(record).to.be.instanceOf(Record);
        });

        it("should have collapseRows prop", () => {
          expect(record.has("collapseRows")).to.be.true;
        });

        it("should have collapseRows value to be true", () => {
          expect(record.get("collapseRows", null)).to.be.true;
        });
      });
    });
  });
});
