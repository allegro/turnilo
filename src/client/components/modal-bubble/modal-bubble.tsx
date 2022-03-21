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

import React from "react";
import { Fn } from "../../../common/utils/general/general";
import { classNames, isInside } from "../../utils/dom/dom";
import { BodyPortal } from "../body-portal/body-portal";
import { GlobalEventListener } from "../global-event-listener/global-event-listener";
import { Shpitz } from "../shpitz/shpitz";
import "./modal-bubble.scss";

interface ModalProps {
  left: number;
  top: number;
  onClose: Fn;
  className?: string;
}

export class ModalBubble extends React.Component<ModalProps, {}> {

  modalRef: HTMLDivElement;

  setModalRef = (el: HTMLDivElement) => {
    this.modalRef = el;
  };

  onMouseDown = (e: MouseEvent) => {
    const target = e.target as Element;
    if (isInside(target, this.modalRef)) return;
    this.props.onClose();
  };

  render() {
    const { className, children, left, top } = this.props;
    return <React.Fragment>
      <GlobalEventListener mouseDown={this.onMouseDown} />
      <BodyPortal left={left} top={top}>
        <div className={classNames("modal-bubble", className)} ref={this.setModalRef}>
          {children}
          <Shpitz direction="up" />
        </div>
      </BodyPortal>
    </React.Fragment>;
  }
}
