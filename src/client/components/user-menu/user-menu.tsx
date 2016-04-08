require('./user-menu.css');

import * as React from 'react';
import { Fn } from "../../../common/utils/general/general";
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
    // this.state = {};

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
          className="user-name"
        >{user.name}</li>
        <li
          className="copy-static-url clipboard"
          onClick={onClose}
        >{STRINGS.logout}</li>
      </ul>
    </BubbleMenu>;
  }
}
