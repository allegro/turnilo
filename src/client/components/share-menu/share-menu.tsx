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
import { Essence, Stage, Timekeeper } from "../../../common/models/index";
import { Fn } from "../../../common/utils/general/general";
import { exportOptions, STRINGS } from "../../config/constants";
import { download, FileFormat, makeFileName } from "../../utils/download/download";
import { DataSetWithTabOptions } from "../../views/cube-view/cube-view";
import { BubbleMenu } from "../bubble-menu/bubble-menu";

export interface ShareMenuProps {
  essence: Essence;
  timekeeper: Timekeeper;
  openOn: Element;
  onClose: Fn;
  getCubeViewHash: (essence: Essence, withPrefix?: boolean) => string;
  getDownloadableDataset?: () => DataSetWithTabOptions;
}

export const ShareMenu: React.SFC<ShareMenuProps> = props => {

  function onExport(fileFormat: FileFormat) {
    const { onClose, getDownloadableDataset, essence, timekeeper } = props;
    const { dataCube, splits } = essence;
    if (!getDownloadableDataset) return;

    const filters = essence.getEffectiveFilter(timekeeper).getFileString(dataCube.timeAttribute);
    const splitsString = splits.toArray().map(split => {
      const dimension = split.getDimension(dataCube.dimensions);
      if (!dimension) return "";
      return `${STRINGS.splitDelimiter}_${dimension.name}`;
    }).join("_");

    download(getDownloadableDataset(), fileFormat, makeFileName(dataCube.name, filters, splitsString));
    onClose();
  }

  const { essence, timekeeper, openOn, getCubeViewHash, onClose } = props;

  const withPrefix = true;
  const url = getCubeViewHash(essence, withPrefix);
  const fixedTimeUrl = essence.filter.isRelative() ? getCubeViewHash(essence.convertToSpecificFilter(timekeeper), withPrefix) : null;

  return <BubbleMenu
    className="header-menu"
    direction="down"
    stage={Stage.fromSize(200, 200)}
    openOn={openOn}
    onClose={onClose}
  >
    <ul className="bubble-list">
      {<CopyToClipboard key="copy-url" text={url}>
        <li onClick={onClose}>
          {fixedTimeUrl ? STRINGS.copyRelativeTimeUrl : STRINGS.copyUrl}
        </li>
      </CopyToClipboard>}
      {fixedTimeUrl && <CopyToClipboard key="copy-specific-url" text={fixedTimeUrl}>
        <li  onClick={onClose}>
          {STRINGS.copyFixedTimeUrl}</li>
      </CopyToClipboard>}
      {exportOptions.map(({ label, fileFormat }) =>
        <li key={`export-${fileFormat}`} onClick={() => onExport(fileFormat)}>
          {label}
        </li>
      )}
    </ul>
  </BubbleMenu>;
};
