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
import { DragEvent, MouseEvent } from "react";
import { HighlightString, SvgIcon } from "..";
import { classNames } from "../../utils/dom/dom";

export const DIMENSION_CLASS_NAME = 'dimension';

export interface DimensionItemProps {
  name: string;
  title: string;
  classSuffix: string;
  dimensionClick: DimensionClickHandler;
  dimensionDragStart: DimensionDragStartHandler;
  searchText: string;
  selected: boolean;
}

export type DimensionClickHandler = (dimensionName: string, e: MouseEvent<HTMLElement>) => void;
export type DimensionDragStartHandler = (dimensionName: string, e: DragEvent<HTMLElement>) => void;

export class DimensionItem extends React.PureComponent<DimensionItemProps, {}> {
  handleClick = (e: MouseEvent<HTMLElement>) => {
    const { name, dimensionClick } = this.props;
    dimensionClick(name, e);
  }

  handleDragStart = (e: DragEvent<HTMLElement>) => {
    const { name, dimensionDragStart } = this.props;
    dimensionDragStart(name, e);
  }

  render() {
    const { name, title, classSuffix, searchText, selected } = this.props;

    const className = classNames(
      DIMENSION_CLASS_NAME,
      'type-' + classSuffix,
      {
        selected
      }
    );

    return <div
      className={className}
      key={name}
      onClick={this.handleClick}
      draggable={true}
      onDragStart={this.handleDragStart}
    >
      <div className="icon">
        <SvgIcon svg={require('../../icons/dim-' + classSuffix + '.svg')} />
      </div>
      <HighlightString className={classNames("label")} text={title} highlight={searchText} />

    </div>;
  }

}
