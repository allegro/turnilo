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
import * as CopyToClipboard from "react-copy-to-clipboard";
import { Clicker, Dimension, Stage } from "../../../common/models/index";
import { Fn } from "../../../common/utils/general/general";
import { STRINGS } from "../../config/constants";
import { BubbleMenu } from "../bubble-menu/bubble-menu";
import { Button } from "../button/button";
import "./segment-action-buttons.scss";

export interface SegmentActionButtonsProps {
  clicker: Clicker;
  dimension?: Dimension;
  segmentLabel?: string;
  disableMoreMenu?: boolean;
  openRawDataModal?: Fn;
  onClose?: Fn;
}

export interface SegmentActionButtonsState {
  moreMenuOpenOn?: Element;
}

export class SegmentActionButtons extends React.Component<SegmentActionButtonsProps, SegmentActionButtonsState> {

  constructor(props: SegmentActionButtonsProps) {
    super(props);
    this.state = {
      moreMenuOpenOn: null
    };
  }

  onSelect(e: MouseEvent) {
    var { onClose, clicker } = this.props;
    clicker.acceptHighlight();
    if (onClose) onClose();
  }

  onCancel(e: MouseEvent) {
    var { onClose, clicker } = this.props;
    clicker.dropHighlight();
    if (onClose) onClose();
  }

  onMore(e: MouseEvent) {
    const { moreMenuOpenOn } = this.state;
    if (moreMenuOpenOn) return this.closeMoreMenu();
    this.setState({
      moreMenuOpenOn: e.target as any
    });
  }

  closeMoreMenu() {
    this.setState({
      moreMenuOpenOn: null
    });
  }

  getUrl(): string {
    const { segmentLabel, dimension } = this.props;
    if (!dimension || !dimension.url) return null;
    return dimension.url.replace(/%s/g, segmentLabel);
  }

  openRawDataModal(): void {
    const { openRawDataModal } = this.props;
    this.closeMoreMenu();
    openRawDataModal();
  }

  renderMoreMenu() {
    const { segmentLabel } = this.props;
    const { moreMenuOpenOn } = this.state;
    if (!moreMenuOpenOn) return null;
    var menuSize = Stage.fromSize(160, 160);

    const bubbleListItems = [
      <CopyToClipboard key="copyValue" text={segmentLabel}>
        <li
          className="clipboard"
          onClick={this.closeMoreMenu.bind(this)}
        >{STRINGS.copyValue}</li>
      </CopyToClipboard>,
      <li
        className="view-raw-data"
        key="view-raw-data"
        onClick={this.openRawDataModal.bind(this)}
      >{STRINGS.displayRawData}</li>
    ];

    var url = this.getUrl();
    if (url) {
      bubbleListItems.push(
        <li key="goToUrl">
          <a href={url} onClick={this.closeMoreMenu.bind(this)} target="_blank">{STRINGS.goToUrl}</a>
        </li>
      );
    }

    return <BubbleMenu
      className="more-menu"
      direction="down"
      stage={menuSize}
      openOn={moreMenuOpenOn}
      align="start"
      onClose={this.closeMoreMenu.bind(this)}
    >
      <ul className="bubble-list">
        {bubbleListItems}
      </ul>
    </BubbleMenu>;
  }

  render() {
    const { disableMoreMenu } = this.props;
    const { moreMenuOpenOn } = this.state;

    return <div className="segment-action-buttons">
      <Button
        type="primary"
        className="mini"
        onClick={this.onSelect.bind(this)}
        title={STRINGS.select}
      />
      <Button
        type="secondary"
        className="mini"
        onClick={this.onCancel.bind(this)}
        title={STRINGS.cancel}
      />
      {disableMoreMenu ? null : <Button
        type="secondary"
        className="mini"
        onClick={this.onMore.bind(this)}
        svg={require("../../icons/full-more-mini.svg")}
        active={Boolean(moreMenuOpenOn)}
      />}
      {this.renderMoreMenu()}
    </div>;
  }
}
