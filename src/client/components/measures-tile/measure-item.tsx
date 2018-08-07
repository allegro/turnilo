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

import * as React from "react";
import { MouseEvent } from "react";
import { SvgIcon } from "..";
import { classNames } from "../../utils/dom/dom";
import { Checkbox } from "../checkbox/checkbox";
import { HighlightString } from "../highlight-string/highlight-string";
import { InfoBubble } from "../info-bubble/info-bubble";
import "./measure-item.scss";
import { MeasureClickHandler } from "./measures-tile";

export interface MeasureItemProps {
  name: string;
  title: string;
  approximate: boolean;
  description?: string;
  selected: boolean;
  measureClick: MeasureClickHandler;
  multiMeasureMode: boolean;
  searchText: string;
}

export const MeasureItem: React.SFC<MeasureItemProps> = ({ title, name, measureClick, description, multiMeasureMode, searchText, approximate, selected }) => {

  const infoBubbleClassName = "measure-info-icon";
  const checkboxType = multiMeasureMode ? "check" : "radio";
  const handleClick = (e: MouseEvent<HTMLElement>) => {
    const target = e.target as Element;
    if (target.classList && target.classList.contains(infoBubbleClassName)) return;
    measureClick(name, e);
  };

  return <div className={classNames("measure-item row", { selected })} onClick={handleClick}>
    <Checkbox className="measure-item-checkbox" type={checkboxType} selected={selected}/>
    <div className="measure-item-name">
      <HighlightString className="label measure-item-label" text={title} highlight={searchText}/>
      {approximate && <SvgIcon className="approximate-measure-icon" svg={require("../../icons/approx.svg")}/>}
    </div>
    {description && <InfoBubble className={infoBubbleClassName} description={description}/>}
  </div>;
};
