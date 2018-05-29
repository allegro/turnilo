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

import * as React from "react";
import * as ReactDOM from "react-dom";
import { Clicker, Essence, Manifest } from "../../../common/models/index";
import { Fn } from "../../../common/utils/general/general";
import { classNames, escapeKey, isInside } from "../../utils/dom/dom";
import { SvgIcon } from "../svg-icon/svg-icon";
import "./vis-selector-menu.scss";

export interface VisSelectorMenuProps {
  clicker: Clicker;
  essence: Essence;
  openOn: Element;
  onClose: Fn;
}

export interface VisSelectorMenuState {
}

export class VisSelectorMenu extends React.Component<VisSelectorMenuProps, VisSelectorMenuState> {
  public mounted: boolean;

  constructor(props: VisSelectorMenuProps) {
    super(props);
    this.globalMouseDownListener = this.globalMouseDownListener.bind(this);
    this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
  }

  componentDidMount() {
    window.addEventListener("mousedown", this.globalMouseDownListener);
    window.addEventListener("keydown", this.globalKeyDownListener);
  }

  componentWillUnmount() {
    window.removeEventListener("mousedown", this.globalMouseDownListener);
    window.removeEventListener("keydown", this.globalKeyDownListener);
  }

  globalMouseDownListener(e: MouseEvent) {
    var { onClose, openOn } = this.props;
    var myElement = ReactDOM.findDOMNode(this);
    if (!myElement) return;
    var target = e.target as Element;

    if (isInside(target, myElement) || isInside(target, openOn)) return;
    onClose();
  }

  globalKeyDownListener(e: KeyboardEvent) {
    if (!escapeKey(e)) return;
    var { onClose } = this.props;
    onClose();
  }

  onVisSelect(v: Manifest) {
    var { clicker } = this.props;
    clicker.changeVisualization(v);
    this.setState({
      menuOpen: false
    });
  }

  renderVisItem(v: Manifest): JSX.Element {
    var { essence } = this.props;
    var { visualization } = essence;

    return <div
      className={classNames("vis-item", (v.name === visualization.name ? "selected" : "not-selected"))}
      key={v.name}
      onClick={this.onVisSelect.bind(this, v)}
    >
      <SvgIcon svg={require("../../icons/vis-" + v.name + ".svg")} />
      <div className="vis-title">{v.title}</div>
    </div>;
  }

  render() {
    var { essence } = this.props;
    var { visualizations } = essence;

    var visItems: JSX.Element[] = null;
    if (visualizations) {
      visItems = visualizations.map(v => {
        return this.renderVisItem(v);
      });
    }

    return <div className="vis-selector-menu">
      {visItems}
    </div>;
  }
}
