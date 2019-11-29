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
import "../../utils/test-utils";
import normalizeStyles from "./normalize-styles";

const defaultRest = {
  pointerEvents: "auto",
  zIndex: 200
};

describe("BodyPortal", () => {
  describe("normalize-styles", () => {

    it("should add 'px' prefix to number dimensions", () => {
      const source = { left: 10, right: 20, top: 30, bottom: 40 };
      const result = { left: "10px", right: "20px", top: "30px", bottom: "40px", ...defaultRest };
      expect(normalizeStyles(source)).to.be.deep.equal(result);
    });
  });

  it("should pass string dimensions unchanged", () => {
    const source = { left: "auto", right: "100%", top: "inherit", bottom: "10em" };
    const result = { left: "auto", right: "100%", top: "inherit", bottom: "10em", ...defaultRest };
    expect(normalizeStyles(source)).to.be.deep.equal(result);
  });

  it("should set pointer events to 'none' when passed 'dissablePointerEvents", () => {
    expect(normalizeStyles({ disablePointerEvents: true })).to.be.deep.equal({ ...defaultRest, pointerEvents: "none" });
  });

  it("should set bigger z-index when aboveAll", () => {
    expect(normalizeStyles({ isAboveAll: true })).to.be.deep.equal({ ...defaultRest, zIndex: 201 });
  });
});
