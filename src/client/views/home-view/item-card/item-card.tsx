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
import { Stage } from '../../../../common/models/index';
import { isInside, classNames } from '../../../utils/dom/dom';
import { SvgIcon, BubbleMenu } from '../../../components/index';

export interface ItemCardProps extends React.Props<any> {
  title: string;
  count?: number;
  description: string;
  icon: string;
  onClick: () => void;

  onEdit?: () => void;
  onDelete?: () => void;
}

export interface ItemCardState {
  moreMenuOpen?: boolean;
}

export class ItemCard extends React.Component< ItemCardProps, ItemCardState> {
  static getNewItemCard(onClick: () => void): JSX.Element {
    return <div className="item-card new-one" onClick={onClick}>
      <div className="inner-container">
        <SvgIcon svg={require('../../../icons/full-add.svg')}/>
      </div>
    </div>;
  }

  constructor() {
    super();

    this.state = {};
  }

  onMoreIconClick(event: MouseEvent) {
    event.preventDefault();
    this.setState({moreMenuOpen: !this.state.moreMenuOpen});
  }

  renderMoreMenu() {
    const { onDelete, onEdit } = this.props;
    var onClose = () => this.setState({moreMenuOpen: false});

    return <BubbleMenu
      className="more-menu"
      direction="down"
      stage={Stage.fromSize(80, 80)}
      openOn={this.refs['more-button'] as any}
      onClose={onClose}
    >
      <ul className="bubble-list">
        <li className="edit" onClick={onEdit}>{STRINGS.edit}</li>
        <li className="delete" onClick={onDelete}>{STRINGS.delete}</li>
      </ul>
    </BubbleMenu>;
  }

  onClick(event: MouseEvent) {
    if (isInside(event.target as any, this.refs['more-button'] as any)) return;

    if (this.state.moreMenuOpen) return;

    this.props.onClick();
  }

  render() {
    const { title, description, icon, onClick, count, onEdit, onDelete } = this.props;
    const { moreMenuOpen } = this.state;

    const hasActions = !!onEdit && !!onDelete;

    return <div className="item-card" onClick={this.onClick.bind(this)}>
      <div className="inner-container">
        <SvgIcon className="view-icon" svg={require(`../../../icons/${icon}.svg`)}/>
        <div className="text">
          <div className="title">{title} {count !== undefined ? <span className="count">{count}</span> : null}</div>
          <div className="description">{description || STRINGS.noDescription}</div>
        </div>
        { hasActions
          ? <div
              className={classNames('more-button icon', {active: moreMenuOpen})}
              onClick={this.onMoreIconClick.bind(this)}
              ref="more-button"
            >
              <SvgIcon svg={require(`../../../icons/caret.svg`)}/>
            </div>
          : null
        }
      </div>
      {moreMenuOpen ? this.renderMoreMenu() : null}
    </div>;
  }
}
