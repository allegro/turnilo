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

import React from "react";
import { Fn } from "../../../common/utils/general/general";
import { classNames, isInside, uniqueId } from "../../utils/dom/dom";
import { BodyPortal } from "../body-portal/body-portal";
import { GlobalEventListener } from "../global-event-listener/global-event-listener";
import { GoldenCenter } from "../golden-center/golden-center";
import { SvgIcon } from "../svg-icon/svg-icon";
import "./modal.scss";

export interface ModalProps {
  className?: string;
  id?: string;
  title?: string;
  mandatory?: boolean;
  onClose?: Fn;
  onEnter?: Fn;
  startUpFocusOn?: string;
}

export interface ModalState {
  id?: string;
}

export class Modal extends React.Component<ModalProps, ModalState> {
  private focusAlreadyGiven = false;

  constructor(props: ModalProps) {
    super(props);
    this.state = {
      id: null
    };
  }

  UNSAFE_componentWillMount() {
    const { id } = this.props;

    this.setState({
      id: id || uniqueId("modal-")
    });
  }

  componentDidMount() {
    this.maybeFocus();
  }

  componentDidUpdate() {
    this.maybeFocus();
  }

  getChildByID(children: NodeList, id: string): HTMLElement {
    if (!children) return null;

    const n = children.length;

    for (let i = 0; i < n; i++) {
      const child = children[i] as HTMLElement;

      if (child.getAttribute && child.getAttribute("id") === id) return child;

      if (child.childNodes) {
        const foundChild = this.getChildByID(child.childNodes, id);
        if (foundChild) return foundChild;
      }
    }

    return null;
  }

  maybeFocus() {
    if (this.props.startUpFocusOn) {
      const myElement = document.getElementById(this.state.id) as Element;

      const target = this.getChildByID(
        myElement.childNodes,
        this.props.startUpFocusOn
      );

      if (!this.focusAlreadyGiven && !!target) {
        target.focus();
        this.focusAlreadyGiven = true;
      }
    }
  }

  onEscape = () => {
    const { onClose, mandatory } = this.props;
    if (!mandatory) onClose();
  };

  onEnter = () => {
    const { onEnter } = this.props;
    if (onEnter) {
      onEnter();
    }
  };

  onMouseDown = (e: MouseEvent) => {
    const { onClose, mandatory } = this.props;
    if (mandatory) return;

    const { id } = this.state;
    // can not use ReactDOM.findDOMNode(this) because portal?
    const myElement = document.getElementById(id) as Element;
    if (!myElement) return;
    const target = e.target as Element;

    if (isInside(target, myElement)) return;
    onClose();
  };

  render() {
    const { className, title, children, onClose } = this.props;
    const { id } = this.state;

    let titleElement: JSX.Element = null;
    if (typeof title === "string") {
      titleElement = <div className="modal-title">
        <div className="text">{title}</div>
        <div className="close" onClick={onClose}>
          <SvgIcon svg={require("../../icons/full-remove.svg")} />
        </div>
      </div>;
    }

    return <BodyPortal fullSize={true}>
      <div className={classNames("modal", className)}>
        <GlobalEventListener
          enter={this.onEnter}
          escape={this.onEscape}
          mouseDown={this.onMouseDown}
        />
        <div className="backdrop" />
        <GoldenCenter>
          <div className="modal-window" id={id}>
            {titleElement}
            {children}
          </div>
        </GoldenCenter>
      </div>
    </BodyPortal>;
  }
}
