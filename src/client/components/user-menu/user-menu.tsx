require('./user-menu.css');

import * as React from 'react';
import { Fn } from '../../../common/utils/general/general';
import { Stage, User } from '../../../common/models/index';
import { STRINGS } from '../../config/constants';
import { BubbleMenu } from '../bubble-menu/bubble-menu';

export interface UserMenuProps extends React.Props<any> {
  openOn: Element;
  onClose: Fn;
  user: User;
}

export interface UserMenuState {
}

export class UserMenu extends React.Component<UserMenuProps, UserMenuState> {
  constructor() {
    super();

  }

  render() {
    var { openOn, onClose, user } = this.props;

    var stage = Stage.fromSize(200, 200);
    return <BubbleMenu
      className="user-menu"
      direction="down"
      stage={stage}
      openOn={openOn}
      onClose={onClose}
    >
      <ul className="bubble-list">
        <li
          className="display-name"
        >{user.displayName}</li>
        <li
          className="logout"
        ><a href="logout">{STRINGS.logout}</a></li>
      </ul>
    </BubbleMenu>;
  }
}
