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
import { MouseEvent, PureComponent } from "react";
import { classNames } from "../../utils/dom/dom";
import { Checkbox } from "../checkbox/checkbox";
import { HighlightString } from "../highlight-string/highlight-string";
import { InfoBubble } from "../info-bubble/info-bubble";
import "./measure-item.scss";
import { MeasureClickHandler } from "./measures-tile";

export interface MeasureItemProps {
  name: string;
  title: string;
  description?: string;
  selected: boolean;
  measureClick: MeasureClickHandler;
  multiMeasureMode: boolean;
  searchText: string;
}

export class MeasureItem extends PureComponent<MeasureItemProps> {
  selectMeasure = (e: MouseEvent<HTMLElement>) => {
    const { name, measureClick } = this.props;
    measureClick(name, e);
  }

  render() {
    const { title, description, multiMeasureMode, searchText, selected } = this.props;
    const checkboxType = multiMeasureMode ? "check" : "radio";

    return <div className={classNames("row", { selected })} onClick={this.selectMeasure}>
      <Checkbox type={checkboxType} selected={selected}/>
      <HighlightString className="label" text={title} highlight={searchText}/>
      {description && <div className="info-bubble"><InfoBubble description={description}/></div>}
    </div>;
  }
}
