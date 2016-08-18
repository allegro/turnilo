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

import { SvgIcon, UserMenu, BubbleMenu, Button } from '../index';

import { STRINGS } from '../../config/constants';

export interface CollectionHeaderBarProps extends React.Props<any> {
  user?: User;
  onNavClick: Fn;
  customization?: Customization;
  title?: string;
  dataCubes: DataCube[];
  collections: Collection[];
  onAddItem?: (dataCube: DataCube) => void;
  onEditCollection?: () => void;
  onDeleteCollection?: () => void;

  editionMode?: boolean;
  onCollectionTitleChange?: (newTitle: string) => void;
  onSave?: () => void;
  onCancel?: () => void;
}

export interface CollectionHeaderBarState {
  userMenuOpenOn?: Element;
  addMenuOpenOn?: Element;
  settingsMenuOpenOn?: Element;
}

export class CollectionHeaderBar extends React.Component<CollectionHeaderBarProps, CollectionHeaderBarState> {
  constructor() {
    super();
    this.state = {
      userMenuOpenOn: null,
      addMenuOpenOn: null,
      settingsMenuOpenOn: null
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

  onSettingsClick(e: MouseEvent) {
    const { settingsMenuOpenOn } = this.state;
    if (settingsMenuOpenOn) return this.onSettingsMenuClose();
    this.setState({
      settingsMenuOpenOn: e.target as Element
    });
  }

  onSettingsMenuClose() {
    this.setState({
      settingsMenuOpenOn: null
    });
  }

  goToSettings() {
    window.location.hash = '#settings';
  }

  renderSettingsMenu() {
    const user = this.props.user as User;
    const { settingsMenuOpenOn } = this.state;
    if (!settingsMenuOpenOn) return null;

    var stage = Stage.fromSize(200, 200);

    return <BubbleMenu
      className="collection-settings-menu"
      direction="down"
      stage={stage}
      openOn={settingsMenuOpenOn}
      onClose={this.onSettingsMenuClose.bind(this)}
    >
      <ul className="bubble-list">
        <li
          className="delete"
          onClick={this.props.onDeleteCollection}
        >{STRINGS.deleteCollection}</li>

        { user && user.allow['settings'] ? <li
          className="general-settings"
          onClick={this.goToSettings.bind(this)}
        >{STRINGS.generalSettings}</li>
        : null }

      </ul>
    </BubbleMenu>;
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

  getHeaderStyle(customization: Customization): React.CSSProperties {
    var headerStyle: any = null;
    if (customization && customization.headerBackground) {
      headerStyle = {
        background: customization.headerBackground
      };
    }

    return headerStyle;
  }

  renderEditableBar() {
    var { customization, title, onSave, onCancel, onCollectionTitleChange } = this.props;

    const onTitleChange = (e: any) => {
      onCollectionTitleChange(e.target.value);
    };

    return <header className="collection-header-bar" style={this.getHeaderStyle(customization)}>
      <div className="left-bar">
        <div className="title">
          <input value={title} onChange={onTitleChange}/>
        </div>
      </div>
      <div className="right-bar">
        <div className="button-group">
          <Button className="cancel" title="Cancel" type="secondary" onClick={onCancel}/>
          <Button className="save" title="Save" type="primary" onClick={onSave}/>
        </div>
      </div>
    </header>;
  }

  render() {
    var { user, onNavClick, customization, title, editionMode, onEditCollection, onAddItem } = this.props;

    if (editionMode) return this.renderEditableBar();

    var userButton: JSX.Element = null;
    if (user) {
      userButton = <div className="icon-button user" onClick={this.onUserMenuClick.bind(this)}>
        <SvgIcon svg={require('../../icons/full-user.svg')}/>
      </div>;
    }

    return <header className="collection-header-bar" style={this.getHeaderStyle(customization)}>
      <div className="left-bar" onClick={onNavClick}>
        <div className="menu-icon">
          <SvgIcon svg={require('../../icons/menu.svg')}/>
        </div>
        <div className="title">{title}</div>
      </div>
      <div className="right-bar">
        { onAddItem ?
          <div className="icon-button add" onClick={this.onAddClick.bind(this)}>
            <SvgIcon svg={require('../../icons/full-add-framed.svg')}/>
          </div>
        : null }

        { onEditCollection ?
          <div className="icon-button edit" onClick={onEditCollection}>
            <SvgIcon svg={require('../../icons/full-edit.svg')}/>
          </div>
        : null }

        <div className="icon-button settings" onClick={this.onSettingsClick.bind(this)}>
          <SvgIcon svg={require('../../icons/full-settings.svg')}/>
        </div>
        {userButton}
      </div>
      {this.renderUserMenu()}
      {this.renderAddMenu()}
      {this.renderSettingsMenu()}
    </header>;
  }
}
