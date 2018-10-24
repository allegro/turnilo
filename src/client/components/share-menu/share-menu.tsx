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
import { Essence } from "../../../common/models/essence/essence";
import { ExternalView } from "../../../common/models/external-view/external-view";
import { Stage } from "../../../common/models/stage/stage";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { getFileString } from "../../../common/utils/formatter/formatter";
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
  externalViews?: ExternalView[];
  getCubeViewHash: (essence: Essence, withPrefix?: boolean) => string;
  getDownloadableDataset?: () => DataSetWithTabOptions;
}

export const ShareMenu: React.SFC<ShareMenuProps> = props => {

  function onExport(fileFormat: FileFormat) {
    const { onClose, getDownloadableDataset, essence, timekeeper } = props;
    const { dataCube, splits } = essence;
    if (!getDownloadableDataset) return;

    const filters = getFileString(essence.getEffectiveFilter(timekeeper));
    const splitsString = splits.splits.toArray().map(split => {
      const dimension = dataCube.getDimension(split.reference);
      if (!dimension) return "";
      return `${STRINGS.splitDelimiter}_${dimension.name}`;
    }).join("_");

    download(getDownloadableDataset(), fileFormat, makeFileName(dataCube.name, filters, splitsString));
    onClose();
  }

  const { essence, timekeeper, openOn, getCubeViewHash, onClose, externalViews = [] } = props;

  return <BubbleMenu
    className="header-menu"
    direction="down"
    stage={Stage.fromSize(200, 200)}
    openOn={openOn}
    onClose={onClose}
  >
    <ul className="bubble-list">

      <CopyToClipboard key="copy-url" text={getCubeViewHash(essence, true)}>
        <li onClick={onClose}>
          {essence.filter.isRelative() ? STRINGS.copyRelativeTimeUrl : STRINGS.copyUrl}
        </li>
      </CopyToClipboard>

      {essence.filter.isRelative() && <CopyToClipboard key="copy-specific-url" text={getCubeViewHash(essence.convertToSpecificFilter(timekeeper), true)}>
        <li onClick={onClose}>
          {STRINGS.copyFixedTimeUrl}
        </li>
      </CopyToClipboard>}

      {exportOptions.map(({ label, fileFormat }) =>
        <li key={`export-${fileFormat}`} onClick={() => onExport(fileFormat)}>
          {label}
        </li>
      )}

      {externalViews.map((externalView: ExternalView, i: number) => {
        const url = externalView.linkGeneratorFn(essence.dataCube, essence.timezone, essence.filter, essence.splits);
        return <li key={`custom-url-${i}`}>
          <a href={url} target={externalView.sameWindow ? "_self" : "_blank"}>
            {`${STRINGS.openIn} ${externalView.title}`}
          </a>
        </li>;
      })}
    </ul>
  </BubbleMenu>;
};
