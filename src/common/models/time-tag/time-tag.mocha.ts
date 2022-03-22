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

import { expect } from "chai";
import { TimeTag } from "./time-tag";

describe("TimeTag", () => {
  it("should read passed name values", () => {
    const timeTag = TimeTag.fromJS({ name: "foobar" });
    expect(timeTag.name).to.be.equal("foobar");
  });

  it("should parse passed time value", () => {
    const timeTag = TimeTag.fromJS({ name: "foobar", time: "2020-01-01" });
    expect(timeTag.time).to.be.deep.equal(new Date("2020-01-01"));
  });

  it("should parse passed lastTimeChecked value", () => {
    const timeTag = TimeTag.fromJS({ name: "foobar", lastTimeChecked: "2020-01-01" });
    expect(timeTag.lastTimeChecked).to.be.deep.equal(new Date("2020-01-01"));
  });

  it("should use time value if lastTimeChecked is missing", () => {
    const timeTag = TimeTag.fromJS({ name: "foobar", time: "2020-01-01" });
    expect(timeTag.lastTimeChecked).to.be.deep.equal(new Date("2020-01-01"));
  });
});
