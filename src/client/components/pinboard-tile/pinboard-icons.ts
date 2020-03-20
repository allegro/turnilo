/*
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

import { Fn } from "../../../common/utils/general/general";
import { TileHeaderIcon } from "../tile-header/tile-header";

const searchIcon = require("../../icons/full-search.svg");
const removeIcon = require("../../icons/full-remove.svg");

interface PinboardIconsProps {
  onClose: Fn;
  onSearchClick: Fn;
  showSearch: boolean;
}

export function pinboardIcons(props: PinboardIconsProps): TileHeaderIcon[] {
  const { showSearch, onClose, onSearchClick } = props;
  return [{
    name: "search",
    ref: "search",
    onClick: onSearchClick,
    svg: searchIcon,
    active: showSearch
  }, {
    name: "close",
    ref: "close",
    onClick: onClose,
    svg: removeIcon
  }];
}
