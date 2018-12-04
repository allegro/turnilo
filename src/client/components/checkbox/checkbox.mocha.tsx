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
import { shallow } from "enzyme";
import * as React from "react";
import { SvgIcon } from "../svg-icon/svg-icon";
import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
  it("should render check icon for type 'check'", () => {
    const check = shallow(<Checkbox selected={true} type="check" />);
    expect(check.find(SvgIcon).prop("svg")).to.be.eq(require("../../icons/check.svg"));
  });

  it("should render check icon when no type provided", () => {
    const check = shallow(<Checkbox selected={true} />);
    expect(check.find(SvgIcon).prop("svg")).to.be.eq(require("../../icons/check.svg"));
  });

  it("should render cross icon for type 'cross'", () => {
    const check = shallow(<Checkbox selected={true} type="cross" />);
    expect(check.find(SvgIcon).prop("svg")).to.be.eq(require("../../icons/x.svg"));
  });

  it("should render no icon for type 'radio'", () => {
    const check = shallow(<Checkbox selected={true} type="radio" />);
    expect(check.find(SvgIcon).length).to.be.eq(0);
  });

  it("shouldn't render icon when is not selected", () => {
    const check = shallow(<Checkbox selected={false} />);
    expect(check.find(SvgIcon).length).to.be.eq(0);
  });

  it("should set color when passed", () => {
    const color = "red";
    const check = shallow(<Checkbox color={color} selected={true} />);
    expect(check.find(".checkbox-body").prop("style")).to.be.deep.eq({ background: color });
  });
});
