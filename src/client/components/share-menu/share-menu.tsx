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
import { Customization } from "../../../common/models/customization/customization";
import { Essence } from "../../../common/models/essence/essence";
import { ExternalView } from "../../../common/models/external-view/external-view";
import { Stage } from "../../../common/models/stage/stage";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { getFileString } from "../../../common/utils/formatter/formatter";
import { Binary } from "../../../common/utils/functional/functional";
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
  openUrlShortenerModal: Binary<string, string, void>;
  customization: Customization;
  getCubeViewHash: (essence: Essence, withPrefix?: boolean) => string;
  getDownloadableDataset?: () => DataSetWithTabOptions;
}

type ExportProps = Pick<ShareMenuProps, "onClose" | "essence" | "timekeeper" | "getDownloadableDataset">;

function onExport(fileFormat: FileFormat, props: ExportProps) {
  const { onClose, getDownloadableDataset, essence, timekeeper } = props;
  const { dataCube, splits } = essence;
  if (!getDownloadableDataset) return;

  const filters = getFileString(essence.getEffectiveFilter(timekeeper));
  const splitsString = splits.splits.toArray().map(split => {
    const dimension = split.reference;
    return `${STRINGS.splitDelimiter}_${dimension.name}`;
  }).join("_");

  download(getDownloadableDataset(), fileFormat, makeFileName(dataCube.name, filters, splitsString));
  onClose();
}

function exportItems(props: ExportProps) {
  return exportOptions.map(({ label, fileFormat }) =>
    <li key={`export-${fileFormat}`} onClick={() => onExport(fileFormat, props)}>
      {label}
    </li>
  );
}

type LinkProps = Pick<ShareMenuProps, "essence" | "customization" | "onClose" | "getCubeViewHash" | "openUrlShortenerModal" | "timekeeper">;

function linkItems({ essence, customization, timekeeper, onClose, getCubeViewHash, openUrlShortenerModal }: LinkProps) {
  const isRelative = essence.filter.isRelative();
  const hash = getCubeViewHash(essence, true);
  const specificHash = getCubeViewHash(essence.convertToSpecificFilter(timekeeper), true);

  function openShortenerModal(url: string, title: string) {
    openUrlShortenerModal(url, title);
    onClose();
  }

  return <React.Fragment>
    <CopyToClipboard key="copy-url" text={hash}>
      <li onClick={onClose}>
        {isRelative ? STRINGS.copyRelativeTimeUrl : STRINGS.copyUrl}
      </li>
    </CopyToClipboard>
    {isRelative && <CopyToClipboard key="copy-specific-url" text={specificHash}>
      <li onClick={onClose}>
        {STRINGS.copyFixedTimeUrl}
      </li>
    </CopyToClipboard>}

    {customization.urlShortener && <React.Fragment>
      <li
        key="short-url"
        onClick={() => openShortenerModal(hash, isRelative ? STRINGS.copyRelativeTimeUrl : STRINGS.copyUrl)}>
        {isRelative ? STRINGS.createShortRelativeUrl : STRINGS.createShortUrl}
      </li>
      {isRelative && <li
        key="short-url-specific"
        onClick={() => openShortenerModal(hash, STRINGS.copyFixedTimeUrl)}>
        {STRINGS.createShortFixedUrl}
      </li>}
    </React.Fragment>}
  </React.Fragment>;
}

type ExternalViewsProps = Pick<ShareMenuProps, "customization" | "essence">;

function externalViewItems({ customization: { externalViews = [] }, essence }: ExternalViewsProps) {
  return externalViews.map((externalView: ExternalView, i: number) => {
    const url = externalView.linkGeneratorFn(essence.dataCube, essence.timezone, essence.filter, essence.splits);
    return <li key={`custom-url-${i}`}>
      <a href={url} target={externalView.sameWindow ? "_self" : "_blank"}>
        {`${STRINGS.openIn} ${externalView.title}`}
      </a>
    </li>;
  });
}

export const ShareMenu: React.SFC<ShareMenuProps> = props => {
  const { openOn, onClose } = props;

  return <BubbleMenu
    className="header-menu"
    direction="down"
    stage={Stage.fromSize(230, 200)}
    openOn={openOn}
    onClose={onClose}
  >
    <ul className="bubble-list">
      {linkItems(props)}
      {exportItems(props)}
      {externalViewItems(props)}
    </ul>
  </BubbleMenu>;
};
