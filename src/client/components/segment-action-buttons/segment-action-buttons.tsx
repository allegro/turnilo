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

import * as React from "react";
import { Dimension } from "../../../common/models/dimension/dimension";
import { Stage } from "../../../common/models/stage/stage";
import { Fn } from "../../../common/utils/general/general";
import { STRINGS } from "../../config/constants";
import { BubbleMenu } from "../bubble-menu/bubble-menu";
import { Button } from "../button/button";
import { SafeCopyToClipboard } from "../safe-copy-to-clipboard/safe-copy-to-clipboard";
import "./segment-action-buttons.scss";

export interface SegmentActionButtonsProps {
  acceptHighlight: Fn;
  dropHighlight: Fn;
  dimension?: Dimension;
  segmentLabel?: string;
  segmentValue?: string;
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

  onSelect = () => {
    const { onClose, acceptHighlight } = this.props;
    acceptHighlight();
    if (onClose) onClose();
  };

  onCancel = () => {
    const { onClose, dropHighlight } = this.props;
    dropHighlight();
    if (onClose) onClose();
  };

  onMore = (e: React.MouseEvent<HTMLElement>) => {
    const { moreMenuOpenOn } = this.state;
    if (moreMenuOpenOn) return this.closeMoreMenu();
    this.setState({
      moreMenuOpenOn: e.target as any
    });
  };

  closeMoreMenu = () => {
    this.setState({
      moreMenuOpenOn: null
    });
  };

  getUrl(): string {
    const { segmentLabel, dimension } = this.props;
    if (!dimension || !dimension.url) return null;
    return dimension.url.replace(/%s/g, segmentLabel);
  }

  openRawDataModal = () => {
    this.closeMoreMenu();
    this.props.openRawDataModal();
  };

  renderMoreMenu() {
    const { segmentValue } = this.props;
    const { moreMenuOpenOn } = this.state;
    if (!moreMenuOpenOn) return null;
    const menuSize = Stage.fromSize(160, 160);

    const url = this.getUrl();
    return <BubbleMenu
      className="more-menu"
      direction="down"
      stage={menuSize}
      openOn={moreMenuOpenOn}
      align="start"
      onClose={this.closeMoreMenu}
    >
      <ul className="bubble-list">
        {segmentValue && <SafeCopyToClipboard key="copyValue" text={segmentValue}>
          <li className="clipboard" onClick={this.closeMoreMenu}>{STRINGS.copyValue}</li>
        </SafeCopyToClipboard>}
        <li
          className="view-raw-data"
          key="view-raw-data"
          onClick={this.openRawDataModal}
        >{STRINGS.displayRawData}</li>
        {url && <li key="goToUrl">
          <a href={url} onClick={this.closeMoreMenu} target="_blank">{STRINGS.goToUrl}</a>
        </li>}
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
        onClick={this.onSelect}
        title={STRINGS.select}
      />
      <Button
        type="secondary"
        className="mini"
        onClick={this.onCancel}
        title={STRINGS.cancel}
      />
      {disableMoreMenu ? null : <Button
        type="secondary"
        className="mini"
        onClick={this.onMore}
        svg={require("../../icons/full-more-mini.svg")}
        active={Boolean(moreMenuOpenOn)}
      />}
      {this.renderMoreMenu()}
    </div>;
  }
}
