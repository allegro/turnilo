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
import { BodyPortal, Shpitz } from "..";
import { StageMock } from "../../../common/models/mocks";
import { BubbleMenu } from "./bubble-menu";

const openOn = {
  getBoundingClientRect: () => ({
    top: 101,
    left: 102,
    height: 201,
    width: 202
  })
} as Element;

const defaultProps = {
  className: "bubble-menu-test",
  openOn,
  stage: StageMock.defaultB(),
  onClose: () => {
  }
};

let oldInnerHeight: number;

describe("<BubbleMenu>", () => {

  beforeEach(() => {
    oldInnerHeight = window.innerHeight;
    // Because innerHeight is readonly on window
    (window as any).innerHeight = 405;
  });

  afterEach(() => {
    // Because innerHeight is readonly on window
    (window as any).innerHeight = oldInnerHeight;
  });

  it("should position correctly for right direction", () => {
    const bubble = shallow(
      <BubbleMenu
        {...defaultProps}
        direction="right"
      />
    );
    const portal = bubble.find(BodyPortal);

    expect(portal.prop("left")).to.be.equal(294);
    expect(portal.prop("top")).to.be.equal(200.5);
    expect(portal.prop("bottom")).to.be.equal(undefined);

    const div = bubble.find(".bubble-menu-test");

    expect(div.prop("style")).to.be.deep.equal({ height: 2, width: undefined });

    const shpitz = bubble.find(Shpitz);

    expect(shpitz.prop("direction")).to.be.equal("right");
    expect(shpitz.prop("style")).to.be.deep.equal({ top: 1, left: 0 });
  });

  it("should position correctly for down direction and center alignment", () => {
    const bubble = shallow(
      <BubbleMenu
        {...defaultProps}
        direction="down"
        align="center"
      />
    );
    const portal = bubble.find(BodyPortal);

    expect(portal.prop("left")).to.be.equal(202);
    expect(portal.prop("top")).to.be.equal(302);
    expect(portal.prop("bottom")).to.be.equal(undefined);

    const div = bubble.find(".bubble-menu-test");

    expect(div.prop("style")).to.be.deep.equal({ height: undefined, width: 2 });

    const shpitz = bubble.find(Shpitz);

    expect(shpitz.prop("direction")).to.be.equal("down");
    expect(shpitz.prop("style")).to.be.deep.equal({ top: 0, left: 1 });
  });

  it("should position correctly for down direction and start alignment", () => {
    const bubble = shallow(
      <BubbleMenu
        {...defaultProps}
        direction="down"
        align="start"
      />
    );
    const portal = bubble.find(BodyPortal);

    expect(portal.prop("left")).to.be.equal(102);
    expect(portal.prop("top")).to.be.equal(302);
    expect(portal.prop("bottom")).to.be.equal(undefined);

    const div = bubble.find(".bubble-menu-test");

    expect(div.prop("style")).to.be.deep.equal({ height: undefined, width: 2 });

    const shpitz = bubble.find(Shpitz);

    expect(shpitz.length).to.be.equal(0);
  });

  it("should position correctly for down direction and end alignment", () => {
    const bubble = shallow(
      <BubbleMenu
        {...defaultProps}
        direction="down"
        align="end"
      />
    );
    const portal = bubble.find(BodyPortal);

    expect(portal.prop("left")).to.be.equal(302);
    expect(portal.prop("top")).to.be.equal(302);
    expect(portal.prop("bottom")).to.be.equal(undefined);

    const div = bubble.find(".bubble-menu-test");

    expect(div.prop("style")).to.be.deep.equal({ height: undefined, width: 2 });

    const shpitz = bubble.find(Shpitz);

    expect(shpitz.length).to.be.equal(0);
  });

  it("should position correctly for up direction and center alignment", () => {
    const bubble = shallow(
      <BubbleMenu
        {...defaultProps}
        direction="up"
        align="center"
      />
    );
    const portal = bubble.find(BodyPortal);

    expect(portal.prop("left")).to.be.equal(202);
    expect(portal.prop("bottom")).to.be.equal(304);
    expect(portal.prop("top")).to.be.equal(undefined);

    const div = bubble.find(".bubble-menu-test");

    expect(div.prop("style")).to.be.deep.equal({ width: 2, height: undefined });

    const shpitz = bubble.find(Shpitz);

    expect(shpitz.prop("direction")).to.be.equal("up");
    expect(shpitz.prop("style")).to.be.deep.equal({ bottom: 0, left: 1 });
  });

  it("should position correctly for up direction and start alignment", () => {
    const bubble = shallow(
      <BubbleMenu
        {...defaultProps}
        direction="up"
        align="start"
      />
    );
    const portal = bubble.find(BodyPortal);

    expect(portal.prop("left")).to.be.equal(102);
    expect(portal.prop("bottom")).to.be.equal(304);
    expect(portal.prop("top")).to.be.equal(undefined);

    const div = bubble.find(".bubble-menu-test");

    expect(div.prop("style")).to.be.deep.equal({ width: 2, height: undefined });

    const shpitz = bubble.find(Shpitz);

    expect(shpitz.length).to.be.equal(0);
  });

  it("should position correctly for up direction and end alignment", () => {
    const bubble = shallow(
      <BubbleMenu
        {...defaultProps}
        direction="up"
        align="end"
      />
    );
    const portal = bubble.find(BodyPortal);

    expect(portal.prop("left")).to.be.equal(302);
    expect(portal.prop("bottom")).to.be.equal(304);
    expect(portal.prop("top")).to.be.equal(undefined);

    const div = bubble.find(".bubble-menu-test");

    expect(div.prop("style")).to.be.deep.equal({ width: 2, height: undefined });

    const shpitz = bubble.find(Shpitz);

    expect(shpitz.length).to.be.equal(0);
  });

  it("should set proper attributes to bubble node", () => {
    const bubble = shallow(
      <BubbleMenu
        {...defaultProps}
        direction="right"
        id="custom-id"
        inside={{ id: "parent" } as Element}
      />
    );
    const div = bubble.find(".bubble-menu-test");

    expect(div.prop("id")).to.be.equal("custom-id");
    expect(div.hasClass("bubble-menu-test")).to.be.true;
    expect(div.prop("data-parent")).to.be.equal("parent");
  });

  it("should respect fixed size property", () => {
    const bubble = shallow(
      <BubbleMenu
        {...defaultProps}
        direction="right"
        fixedSize={true}
      />
    );
    const div = bubble.find(".bubble-menu-test");

    expect(div.prop("style")).to.be.deep.equal({ width: 2, height: 2 });
  });
});
