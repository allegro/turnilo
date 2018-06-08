/*
 * Copyright 2015-2016 Imply Data, Inc.
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
import { testImmutableClass } from "immutable-class-tester";
import { SettingsLocation } from "./settings-location";

describe("SettingsLocation", () => {
  it("is an immutable class", () => {
    testImmutableClass(SettingsLocation, [
      {
        location: "file",
        uri: "../private/lol.yaml"
      },
      {
        location: "mysql",
        uri: "mysql://root:@192.168.99.100:3306/datazoo"
      },
      {
        location: "mysql",
        uri: "mysql://root:@192.168.99.100:3306/datazoo",
        table: "swiv_state"
      }
    ]);
  });

  describe("gets the right format", () => {
    it("gets yaml", () => {
      var settingsLocation = SettingsLocation.fromJS({
        location: "file",
        uri: "../private/lol.yaml"
      });

      expect(settingsLocation.getFormat()).to.equal("yaml");
    });

  });

});
