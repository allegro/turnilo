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
import { shallow } from "enzyme";
import React from "react";
import { StageFixtures } from "../../../common/models/stage/stage.fixtures";
import { BodyPortal } from "../body-portal/body-portal";
import { Shpitz } from "../shpitz/shpitz";
import { Align, BubbleMenu, Direction, OFFSET_H } from "./bubble-menu";

const windowHeight = 405;
const anchor = {
  top: 101,
  left: 102,
  height: 201,
  width: 202
};
const stage = StageFixtures.defaultB();
const containerStage = StageFixtures.container();

const openOn = {
  getBoundingClientRect: () => anchor
} as Element;

const contentClassName = "js-bubble-menu";
const contentSelector = `.${contentClassName}`;

const defaultProps = {
  className: contentClassName,
  openOn,
  stage,
  containerStage,
  onClose: () => {
  }
};

let oldInnerHeight: number;

function renderBubble(direction: Direction, align: Align = "center") {
  return shallow(<BubbleMenu{...defaultProps} direction={direction} align={align} />);
}

describe("<BubbleMenu>", () => {

  describe("Right direction", () => {
    it("should pass correct coordinates to bubble", () => {
      const bubble = renderBubble("right");
      const portal = bubble.find(BodyPortal);

      expect(portal.prop("left")).to.be.equal(anchor.left + anchor.width - OFFSET_H);
      expect(portal.prop("top")).to.be.equal(anchor.top + anchor.height / 2 - stage.height / 2);
      expect(portal.prop("bottom")).to.be.equal(undefined);
    });

    it("should set correct dimensions to content", () => {
      const bubble = renderBubble("right");
      const div = bubble.find(contentSelector);

      expect(div.prop("style")).to.be.deep.equal({
        height: stage.height,
        width: undefined,
        maxHeight: undefined,
        maxWidth: containerStage.width
      });
    });

    it("should set correct style to shpitz", () => {
      const bubble = renderBubble("right");
      const shpitz = bubble.find(Shpitz);

      expect(shpitz.prop("direction")).to.be.equal("right");
      expect(shpitz.prop("style")).to.be.deep.equal({ top: stage.height / 2, left: 0 });
    });
  });

  describe("Down direction", () => {
    describe("Center alignment", () => {
      it("should pass correct coordinates to bubble", () => {
        const bubble = renderBubble("down", "center");
        const portal = bubble.find(BodyPortal);

        expect(portal.prop("left")).to.be.equal(anchor.left + anchor.width / 2 - stage.width / 2);
        expect(portal.prop("top")).to.be.equal(anchor.top + anchor.height);
        expect(portal.prop("bottom")).to.be.equal(undefined);

      });

      it("should set correct dimensions to content", () => {
        const bubble = renderBubble("down", "center");
        const div = bubble.find(contentSelector);

        expect(div.prop("style")).to.be.deep.equal({
          height: undefined,
          width: stage.width,
          maxWidth: undefined,
          maxHeight: containerStage.height
        });
      });

      it("should set correct style to shpitz", () => {
        const bubble = renderBubble("down", "center");
        const shpitz = bubble.find(Shpitz);

        expect(shpitz.prop("direction")).to.be.equal("down");
        expect(shpitz.prop("style")).to.be.deep.equal({ top: 0, left: stage.width / 2 });
      });
    });

    describe("Start alignment", () => {
      it("should pass correct coordinates to bubble", () => {
        const bubble = renderBubble("down", "start");
        const portal = bubble.find(BodyPortal);

        expect(portal.prop("left")).to.be.equal(anchor.left);
        expect(portal.prop("top")).to.be.equal(anchor.top + anchor.height);
        expect(portal.prop("bottom")).to.be.equal(undefined);

      });

      it("should set correct dimensions to content", () => {
        const bubble = renderBubble("down", "start");
        const div = bubble.find(contentSelector);

        expect(div.prop("style")).to.be.deep.equal({
          height: undefined,
          width: stage.width,
          maxWidth: undefined,
          maxHeight: containerStage.height
        });
      });

      it("should omit shpitz", () => {
        const bubble = renderBubble("down", "start");
        const shpitz = bubble.find(Shpitz);

        expect(shpitz.length).to.be.equal(0);
      });
    });

    describe("End alignment", () => {
      it("should pass correct coordinates to bubble", () => {
        const bubble = renderBubble("down", "end");
        const portal = bubble.find(BodyPortal);

        expect(portal.prop("left")).to.be.equal(anchor.left + anchor.width - stage.width);
        expect(portal.prop("top")).to.be.equal(anchor.top + anchor.height);
        expect(portal.prop("bottom")).to.be.equal(undefined);
      });

      it("should set correct dimensions to content", () => {
        const bubble = renderBubble("down", "end");
        const div = bubble.find(contentSelector);

        expect(div.prop("style")).to.be.deep.equal({
          height: undefined,
          width: stage.width,
          maxHeight: containerStage.height,
          maxWidth: undefined
        });
      });

      it("should omit shpitz", () => {
        const bubble = renderBubble("down", "end");
        const shpitz = bubble.find(Shpitz);

        expect(shpitz.length).to.be.equal(0);
      });
    });
  });

  describe("Up direction", () => {

    beforeEach(() => {
      oldInnerHeight = window.innerHeight;
      // Because innerHeight is readonly on window
      (window as any).innerHeight = windowHeight;
    });

    afterEach(() => {
      // Because innerHeight is readonly on window
      (window as any).innerHeight = oldInnerHeight;
    });

    describe("Center alignment", () => {
      it("should pass correct coordinates to bubble", () => {
        const bubble = renderBubble("up", "center");
        const portal = bubble.find(BodyPortal);

        expect(portal.prop("left")).to.be.equal(anchor.left + anchor.width / 2 - stage.width / 2);
        expect(portal.prop("bottom")).to.be.equal(windowHeight - anchor.top);
        expect(portal.prop("top")).to.be.equal(undefined);

      });

      it("should set correct dimensions to content", () => {
        const bubble = renderBubble("up", "center");
        const div = bubble.find(contentSelector);

        expect(div.prop("style")).to.be.deep.equal({
          width: stage.width,
          height: undefined,
          maxHeight: containerStage.height,
          maxWidth: undefined
        });
      });

      it("should set correct style to shpitz", () => {
        const bubble = renderBubble("up", "center");
        const shpitz = bubble.find(Shpitz);

        expect(shpitz.prop("direction")).to.be.equal("up");
        expect(shpitz.prop("style")).to.be.deep.equal({ bottom: 0, left: stage.width / 2 });
      });
    });

    describe("Start alignment", () => {
      it("should pass correct coordinates to bubble", () => {
        const bubble = renderBubble("up", "start");
        const portal = bubble.find(BodyPortal);

        expect(portal.prop("left")).to.be.equal(anchor.left);
        expect(portal.prop("bottom")).to.be.equal(windowHeight - anchor.top);
        expect(portal.prop("top")).to.be.equal(undefined);
      });

      it("should set correct dimensions to content", () => {
        const bubble = renderBubble("up", "start");
        const div = bubble.find(contentSelector);

        expect(div.prop("style")).to.be.deep.equal({
          width: stage.width,
          height: undefined,
          maxWidth: undefined,
          maxHeight: containerStage.height
        });
      });

      it("should omit shpitz", () => {
        const bubble = renderBubble("up", "start");
        const shpitz = bubble.find(Shpitz);

        expect(shpitz.length).to.be.equal(0);
      });
    });

    describe("End alignment", () => {
      it("should pass correct coordinates to bubble", () => {
        const bubble = renderBubble("up", "end");
        const portal = bubble.find(BodyPortal);

        expect(portal.prop("left")).to.be.equal(anchor.left + anchor.width - stage.width);
        expect(portal.prop("bottom")).to.be.equal(windowHeight - anchor.top);
        expect(portal.prop("top")).to.be.equal(undefined);
      });

      it("should set correct dimensions to content", () => {
        const bubble = renderBubble("up", "end");
        const div = bubble.find(contentSelector);

        expect(div.prop("style")).to.be.deep.equal({
          height: undefined,
          width: stage.width,
          maxHeight: containerStage.height,
          maxWidth: undefined
        });
      });

      it("should omit shpitz", () => {
        const bubble = renderBubble("up", "end");
        const shpitz = bubble.find(Shpitz);

        expect(shpitz.length).to.be.equal(0);
      });
    });
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
    const div = bubble.find(contentSelector);

    expect(div.prop("id")).to.be.equal("custom-id");
    expect(div.hasClass(contentClassName)).to.be.true;
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
    const div = bubble.find(contentSelector);

    expect(div.prop("style")).to.be.deep.equal({ width: 2, height: 2 });
  });
});
