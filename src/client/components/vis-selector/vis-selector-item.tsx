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

import React from "react";
import { VisualizationManifest } from "../../../common/models/visualization-manifest/visualization-manifest";
import { Unary } from "../../../common/utils/functional/functional";
import { classNames } from "../../utils/dom/dom";
import { SvgIcon } from "../svg-icon/svg-icon";
import "./vis-selector-item.scss";

interface VisSelectorItemProps {
  visualization: VisualizationManifest;
  selected: boolean;
  onClick?: Unary<VisualizationManifest, void>;
}

export const VisSelectorItem: React.FunctionComponent<VisSelectorItemProps> = ({ visualization, selected, onClick }) =>
  <div
    className={classNames("vis-item", (selected ? "selected" : "not-selected"))}
    key={visualization.name}
    onClick={() => onClick && !selected && onClick(visualization)}
  >
    <SvgIcon svg={require("../../icons/vis-" + visualization.name + ".svg")} />
    <div className="vis-title">{visualization.title}</div>
  </div>;
