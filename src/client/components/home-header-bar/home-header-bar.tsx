require('./home-header-bar.css');

import * as React from 'react';
import { Fn } from '../../../common/utils/general/general';
import { Stage, Clicker, User, Customization } from '../../../common/models/index';
import { SvgIcon } from '../svg-icon/svg-icon';
import { UserMenu } from '../user-menu/user-menu';

export interface HomeHeaderBarProps extends React.Props<any> {
  user?: User;
  onNavClick: Fn;
  customization?: Customization;
  title?: string;
}

export interface HomeHeaderBarState {
  userMenuOpenOn?: Element;
}

export class HomeHeaderBar extends React.Component<HomeHeaderBarProps, HomeHeaderBarState> {
  constructor() {
    super();
    this.state = {
      userMenuOpenOn: null
    };
  }

  // User menu

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
    const { user } = this.props;
    const { userMenuOpenOn } = this.state;
    if (!userMenuOpenOn) return null;

    return <UserMenu
      openOn={userMenuOpenOn}
      onClose={this.onUserMenuClose.bind(this)}
      user={user}
    />;
  }

  render() {
    var { user, onNavClick, customization, title } = this.props;

    // One day
    //<div className="icon-button" onClick={this.handleSettings.bind(this)}>
    //  <SvgIcon className="not-implemented" svg={require('../../icons/full-settings.svg')}/>
    //</div>

    var userButton: JSX.Element = null;
    if (user) {
      userButton = <div className="icon-button user" onClick={this.onUserMenuClick.bind(this)}>
        <SvgIcon svg={require('../../icons/full-user.svg')}/>
      </div>;
    }

    var headerStyle: any = null;
    if (customization && customization.headerBackground) {
      headerStyle = {
        background: customization.headerBackground
      };
    }

    return <header className="home-header-bar" style={headerStyle}>
      <div className="left-bar" onClick={onNavClick}>
        <div className="menu-icon">
          <SvgIcon svg={require('../../icons/menu.svg')}/>
        </div>
        <div className="title">{title}</div>
      </div>
      <div className="right-bar">
        {this.props.children}
        {userButton}
      </div>
      {this.renderUserMenu()}
    </header>;
  }
}
