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
import { boolean, stringContains, stringIn, stringMatch } from "../../../../common/models/filter-clause/filter-clause.fixtures";
import { isClauseEditable } from "./is-clause-editable";

describe("isClauseEditable", () => {
  it("should return false for clause with not property set to true", () => {
    expect(isClauseEditable(stringIn("foobar", [], true))).to.be.false;
  });

  it("should return false for string clause with CONTAINS action", () => {
    expect(isClauseEditable(stringContains("foobar", "bazz"))).to.be.false;
  });

  it("should return false for string clause with MATCH action", () => {
    expect(isClauseEditable(stringMatch("foobar", "bazz"))).to.be.false;
  });

  it("should return true for string clause with action IN and not property set to false", () => {
    expect(isClauseEditable(stringIn("foobar", [], false))).to.be.true;
  });

  it("should return true for string clause with not property set to false", () => {
    expect(isClauseEditable(boolean("foobar", [], false))).to.be.true;
  });
});
