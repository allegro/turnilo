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
import { mount } from "enzyme";
import React from "react";
import { spy } from "sinon";
import { noop } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { GlobalEventListener } from "../global-event-listener/global-event-listener";
import { ModalBubble } from "./modal-bubble";

const mountModalBubbleInDiv = (onClose: Fn = noop) => mount(<div className="root">
  <ModalBubble
    left={100}
    top={200}
    onClose={onClose} />
  <div className="outside" />
</div>);

describe("ModalBubble", () => {
  describe("onMouseDown handler", () => {
    it("should call onClose when clicked outside modal", () => {
      const onCloseSpy = spy();
      const modal = mountModalBubbleInDiv(onCloseSpy);
      const globalEventListener = modal.find(GlobalEventListener);
      const mouseDownHandler = globalEventListener.prop("mouseDown");
      const outside = modal.find(".outside");
      const target = outside.getDOMNode();

      mouseDownHandler.call(null, { target });

      expect(onCloseSpy.called).to.be.true;
    });

    it("should not call onClose when clicked inside modal", () => {
      const onCloseSpy = spy();
      const modal = mountModalBubbleInDiv(onCloseSpy);
      const globalEventListener = modal.find(GlobalEventListener);
      const mouseDownHandler = globalEventListener.prop("mouseDown");
      const modalBubble = modal.find(ModalBubble);
      const target = modalBubble.getDOMNode();

      mouseDownHandler.call(null, { target });

      expect(onCloseSpy.called).to.be.false;
    });
  });
});
