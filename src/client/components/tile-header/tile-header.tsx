/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import {classNames} from '../../utils/dom/dom';
require('./tile-header.css');

import * as React from 'react';
import { SvgIcon } from '../svg-icon/svg-icon';

export interface TileHeaderIcon {
  name: string;
  svg: string;
  onClick: React.MouseEventHandler;
  ref?: string;
  active?: boolean;
}

export interface TileHeaderProps extends React.Props<any> {
  title: string;
  onDragStart?: React.DragEventHandler;
  icons?: TileHeaderIcon[];
}

export interface TileHeaderState {
}

export class TileHeader extends React.Component<TileHeaderProps, TileHeaderState> {

  constructor() {
    super();

  }

  renderIcons() {
    const { icons } = this.props;
    if (!icons || !icons.length) return null;

    var iconElements = icons.map(icon => {
      return <div
        className={classNames('icon', icon.name, { active: icon.active })}
        key={icon.name}
        onClick={icon.onClick}
        ref={icon.ref}
      >
        <SvgIcon svg={icon.svg}/>
      </div>;
    });

    return <div className="icons">{iconElements}</div>;
  }

  render() {
    const { title, onDragStart } = this.props;

    return <div className="tile-header" draggable={onDragStart ? true : null} onDragStart={onDragStart}>
      <div className="title">{title}</div>
      {this.renderIcons()}
    </div>;
  }
}
