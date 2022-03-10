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

import { Duration, Timezone } from "chronoshift";
import React from "react";
import { ClientDataCube, getMaxTime } from "../../../common/models/data-cube/data-cube";
import { Stage } from "../../../common/models/stage/stage";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { formatDateTime, formatTimeElapsed } from "../../../common/utils/time/time";
import { STRINGS } from "../../config/constants";
import { BubbleMenu } from "../bubble-menu/bubble-menu";
import { Dropdown } from "../dropdown/dropdown";
import "./auto-refresh-menu.scss";

const AUTO_REFRESH_LABELS: Record<string, string> = {
  null: "Off",
  PT5S: "Every 5 seconds",
  PT15S: "Every 15 seconds",
  PT1M: "Every minute",
  PT5M: "Every 5 minutes",
  PT10M: "Every 10 minutes",
  PT30M: "Every 30 minutes"
};

const REFRESH_DURATIONS: Duration[] = [
  null,
  Duration.fromJS("PT5S"),
  Duration.fromJS("PT15S"),
  Duration.fromJS("PT1M"),
  Duration.fromJS("PT5M"),
  Duration.fromJS("PT10M"),
  Duration.fromJS("PT30M")
];

export interface AutoRefreshMenuProps {
  openOn: Element;
  onClose: Fn;
  autoRefreshRate: Duration;
  setAutoRefreshRate: Unary<Duration, void>;
  refreshMaxTime: Fn;
  dataCube: ClientDataCube;
  timekeeper: Timekeeper;
  timezone: Timezone;
}

const STAGE = Stage.fromSize(240, 200);

function renderRefreshIntervalDropdown(autoRefreshRate: Duration, setAutoRefreshRate: Unary<Duration, void>) {
  return <Dropdown<Duration>
    label={STRINGS.autoUpdate}
    items={REFRESH_DURATIONS}
    selectedItem={autoRefreshRate}
    renderItem={d => AUTO_REFRESH_LABELS[String(d)] || `Custom ${d}`}
    onSelect={setAutoRefreshRate}
  />;
}

function updatedText(dataCube: ClientDataCube, timekeeper: Timekeeper, timezone: Timezone): string {
  const { refreshRule } = dataCube;
  if (refreshRule.isRealtime()) {
    return "Updated ~1 second ago";
  } else if (refreshRule.isFixed()) {
    return `Fixed to ${formatDateTime(refreshRule.time, timezone)}`;
  } else { // refreshRule is query
    const maxTime = getMaxTime(dataCube, timekeeper);
    if (!maxTime) return null;
    return `Updated ${formatTimeElapsed(maxTime, timezone)} ago`;
  }
}

export const AutoRefreshMenu: React.FunctionComponent<AutoRefreshMenuProps> = ({ autoRefreshRate, setAutoRefreshRate, openOn, onClose, dataCube, refreshMaxTime, timekeeper, timezone }) =>
  <BubbleMenu
    className="auto-refresh-menu"
    direction="down"
    stage={STAGE}
    openOn={openOn}
    onClose={onClose}
  >
    {renderRefreshIntervalDropdown(autoRefreshRate, setAutoRefreshRate)}
    <button className="update-now-button" onClick={refreshMaxTime}>Update now</button>
    <div className="update-info">{updatedText(dataCube, timekeeper, timezone)}</div>
  </BubbleMenu>;
