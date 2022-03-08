/*
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
import { shallow } from "enzyme";
import React from "react";
import { MarkdownNode } from "./markdown-node";

describe("<MarkdownNode>", () => {

  it("should render html for markdown", () => {
    const wrapper = shallow(<MarkdownNode markdown={"*strong* **em** [link](example.com)"} />);
    const content = wrapper.find(".markdown-content");

    expect(content.html()).to.be.equal("<div class=\"markdown-content\"><em>strong</em> <strong>em</strong> <a href=\"example.com\">link</a></div>");
  });
});
