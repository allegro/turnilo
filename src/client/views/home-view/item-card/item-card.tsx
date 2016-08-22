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

require('./item-card.css');

import * as React from 'react';
import { STRINGS } from '../../../config/constants';
import { SvgIcon } from '../../../components/svg-icon/svg-icon';

export interface ItemCardProps extends React.Props<any> {
  title: string;
  count?: number;
  description: string;
  icon: string;
  onClick: () => void;
}

export interface ItemCardState {
}

export class ItemCard extends React.Component< ItemCardProps, ItemCardState> {
  static getNewItemCard(onClick: () => void): JSX.Element {
    return <div className="item-card new-one" onClick={onClick}>
      <div className="inner-container">
        <SvgIcon svg={require('../../../icons/full-add.svg')}/>
      </div>
    </div>;
  }

  render() {
    const { title, description, icon, onClick, count } = this.props;

    return <div className="item-card" onClick={onClick}>
      <div className="inner-container">
        <SvgIcon svg={require(`../../../icons/${icon}.svg`)}/>
        <div className="text">
          <div className="title">{title} {count !== undefined ? <span className="count">{count}</span> : null}</div>
          <div className="description">{description || STRINGS.noDescription}</div>
        </div>
      </div>
    </div>;
  }
}
