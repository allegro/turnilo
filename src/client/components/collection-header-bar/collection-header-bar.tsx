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

require('./collection-header-bar.css');

import * as React from 'react';
import { Fn } from '../../../common/utils/general/general';
import { User, Customization, DataCube, Stage, Collection } from '../../../common/models/index';
import { SvgIcon } from '../svg-icon/svg-icon';
import { UserMenu } from '../user-menu/user-menu';
import { BubbleMenu } from '../bubble-menu/bubble-menu';

import { STRINGS } from '../../config/constants';

export interface CollectionHeaderBarProps extends React.Props<any> {
  user?: User;
  onNavClick: Fn;
  customization?: Customization;
  title?: string;
  dataCubes: DataCube[];
  collections: Collection[];
  onAddItem?: (dataCube: DataCube) => void;
}

export interface CollectionHeaderBarState {
  userMenuOpenOn?: Element;
  addMenuOpenOn?: Element;
}

export class CollectionHeaderBar extends React.Component<CollectionHeaderBarProps, CollectionHeaderBarState> {
  constructor() {
    super();
    this.state = {
      userMenuOpenOn: null,
      addMenuOpenOn: null
    };
  }

  onUserMenuClick(e: MouseEvent) {
    const { userMenuOpenOn } = this.state;
    if (userMenuOpenOn) return this.onUserMenuClose();
    this.setState({
      userMenuOpenOn: e.target as Element
    });
  }

  onUserMenuClose() {
    this.setState({
      userMenuOpenOn: null
    });
  }

  renderUserMenu() {
    const { user, customization } = this.props;
    const { userMenuOpenOn } = this.state;
    if (!userMenuOpenOn) return null;

    return <UserMenu
      customization={customization}
      openOn={userMenuOpenOn}
      onClose={this.onUserMenuClose.bind(this)}
      user={user}
    />;
  }

  onAddClick(e: MouseEvent) {
    const { addMenuOpenOn } = this.state;
    if (addMenuOpenOn) return this.onAddMenuClose();
    this.setState({
      addMenuOpenOn: e.target as Element
    });
  }

  onAddMenuClose() {
    this.setState({
      addMenuOpenOn: null
    });
  }

  renderAddMenu() {
    const { dataCubes } = this.props;
    const { addMenuOpenOn } = this.state;
    if (!addMenuOpenOn) return null;

    var stage = Stage.fromSize(200, 200);

    var items = dataCubes.map((dataCube) => {
      return <li
        className="data-cube"
        key={dataCube.name}
        onClick={this.props.onAddItem.bind(this, dataCube)}
      >{dataCube.title}</li>;
    });

    return <BubbleMenu
      className="add-menu"
      direction="down"
      stage={stage}
      openOn={addMenuOpenOn}
      onClose={this.onAddMenuClose.bind(this)}
    >
      <div className="bubble-list-title">{STRINGS.addFromCube}:</div>
      <ul className="bubble-list">{items}</ul>
    </BubbleMenu>;
  }

  render() {
    var { user, onNavClick, customization, title, onAddItem } = this.props;

    var userButton: JSX.Element = null;
    if (user) {
      userButton = <div className="icon-button user" onClick={this.onUserMenuClick.bind(this)}>
        <SvgIcon svg={require('../../icons/full-user.svg')}/>
      </div>;
    }

    var addButton: JSX.Element = null;
    if (onAddItem) {
      addButton = <div className="icon-button add" onClick={this.onAddClick.bind(this)}>
        <SvgIcon svg={require('../../icons/full-add-framed.svg')}/>
      </div>;
    }

    var headerStyle: any = null;
    if (customization && customization.headerBackground) {
      headerStyle = {
        background: customization.headerBackground
      };
    }

    return <header className="collection-header-bar" style={headerStyle}>
      <div className="left-bar" onClick={onNavClick}>
        <div className="menu-icon">
          <SvgIcon svg={require('../../icons/menu.svg')}/>
        </div>
        <div className="title">{title}</div>
      </div>
      <div className="right-bar">
        {addButton}
        {userButton}
      </div>
      {this.renderUserMenu()}
      {this.renderAddMenu()}
    </header>;
  }
}
