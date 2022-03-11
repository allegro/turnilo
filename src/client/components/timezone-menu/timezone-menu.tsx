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

import { Timezone } from "chronoshift";
import React from "react";
import { Stage } from "../../../common/models/stage/stage";
import { Fn } from "../../../common/utils/general/general";
import { STRINGS } from "../../config/constants";
import { BubbleMenu } from "../bubble-menu/bubble-menu";
import { Dropdown } from "../dropdown/dropdown";
import "./timezone-menu.scss";

export interface TimezoneMenuProps {
  openOn: Element;
  onClose: Fn;
  changeTimezone?: (timezone: Timezone) => void;
  timezone?: Timezone;
  timezones?: Timezone[];
}

export const TimezoneMenu: React.FunctionComponent<TimezoneMenuProps> = ({ timezone, timezones, onClose, changeTimezone, openOn }) => {

  function selectTimezone(newTimezone: Timezone) {
    changeTimezone(newTimezone);
    onClose();
  }

  return <BubbleMenu
    className="timezone-menu"
    direction="down"
    stage={Stage.fromSize(240, 200)}
    openOn={openOn}
    onClose={onClose}
  >
    <Dropdown<Timezone>
      label={STRINGS.timezone}
      selectedItem={timezone}
      renderItem={(d: Timezone) => d.toString().replace(/_/g, " ")}
      items={timezones}
      onSelect={selectTimezone}
    />
  </BubbleMenu>;
};
