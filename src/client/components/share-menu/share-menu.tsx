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
import { ClientCustomization } from "../../../common/models/customization/customization";
import { Essence } from "../../../common/models/essence/essence";
import { ExternalView } from "../../../common/models/external-view/external-view";
import { Stage } from "../../../common/models/stage/stage";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { Binary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { exportOptions, STRINGS } from "../../config/constants";
import { download, FileFormat, fileNameBase } from "../../utils/download/download";
import { DataSetWithTabOptions } from "../../views/cube-view/cube-view";
import { BubbleMenu } from "../bubble-menu/bubble-menu";
import { SafeCopyToClipboard } from "../safe-copy-to-clipboard/safe-copy-to-clipboard";

export interface ShareMenuProps {
  essence: Essence;
  timekeeper: Timekeeper;
  openOn: Element;
  onClose: Fn;
  openUrlShortenerModal: Binary<string, string, void>;
  customization: ClientCustomization;
  urlForEssence: (essence: Essence) => string;
  getDownloadableDataset?: () => DataSetWithTabOptions;
}

type ExportProps = Pick<ShareMenuProps, "timekeeper" | "essence" | "onClose" | "getDownloadableDataset" | "customization">;

function onExport(fileFormat: FileFormat, props: ExportProps) {
  const { essence, timekeeper, onClose, getDownloadableDataset, customization: { locale: { exportEncoding } } } = props;
  const dataSetWithTabOptions = getDownloadableDataset();
  if (!dataSetWithTabOptions.dataset) return;
  const fileName = fileNameBase(essence, timekeeper);

  download(dataSetWithTabOptions, fileFormat, `${fileName}_export`, exportEncoding);
  onClose();
}

function exportItems(props: ExportProps) {
  return exportOptions.map(({ label, fileFormat }) =>
    <li key={`export-${fileFormat}`} onClick={() => onExport(fileFormat, props)}>
      {label}
    </li>
  );
}

type LinkProps = Pick<ShareMenuProps, "essence" | "customization" | "onClose" | "urlForEssence" | "openUrlShortenerModal" | "timekeeper">;

function linkItems({ essence, customization, timekeeper, onClose, urlForEssence, openUrlShortenerModal }: LinkProps) {
  const isRelative = essence.filter.isRelative();
  const hash = urlForEssence(essence);
  const specificHash = urlForEssence(essence.convertToSpecificFilter(timekeeper));

  function openShortenerModal(url: string, title: string) {
    openUrlShortenerModal(url, title);
    onClose();
  }

  return <React.Fragment>
    <SafeCopyToClipboard key="copy-url" text={hash}>
      <li onClick={onClose}>
        {isRelative ? STRINGS.copyRelativeTimeUrl : STRINGS.copyUrl}
      </li>
    </SafeCopyToClipboard>
    {isRelative && <SafeCopyToClipboard key="copy-specific-url" text={specificHash}>
      <li onClick={onClose}>
        {STRINGS.copyFixedTimeUrl}
      </li>
    </SafeCopyToClipboard>}

    {customization.hasUrlShortener && <React.Fragment>
      <li
        key="short-url"
        onClick={() => openShortenerModal(hash, isRelative ? STRINGS.copyRelativeTimeUrl : STRINGS.copyUrl)}>
        {isRelative ? STRINGS.createShortRelativeUrl : STRINGS.createShortUrl}
      </li>
      {isRelative && <li
        key="short-url-specific"
        onClick={() => openShortenerModal(specificHash, STRINGS.copyFixedTimeUrl)}>
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

export function ShareMenu(props: ShareMenuProps) {
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
}
