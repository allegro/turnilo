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
import { SvgIcon } from "../../../components/index";
import { MarkdownNode } from "../../../components/markdown-node/markdown-node";
import { STRINGS } from "../../../config/constants";
import "./data-cube-card.scss";

export interface DataCubeCardProps {
  title: string;
  count?: number;
  description: string;
  icon: string;
  onClick: () => void;
}

export const DataCubeCard: React.SFC<DataCubeCardProps> = ({ title, description, icon, count, onClick }) =>
  <div className="data-cube-card" onClick={onClick}>
    <div className="inner-container">
      <SvgIcon className="view-icon" svg={require(`../../../icons/${icon}.svg`)}/>
      <div className="text">
        <div className="title">{title} {count !== undefined ? <span className="count">{count}</span> : null}</div>
        <div className="description"><MarkdownNode markdown={description || STRINGS.noDescription}/></div>
      </div>
    </div>
  </div>;
