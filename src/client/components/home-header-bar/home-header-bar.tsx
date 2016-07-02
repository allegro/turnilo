require('./home-header-bar.css');

import * as React from 'react';
import { Fn } from '../../../common/utils/general/general';
import { Stage, Clicker, User, Customization } from '../../../common/models/index';
import { SvgIcon } from '../svg-icon/svg-icon';

export interface HomeHeaderBarProps extends React.Props<any> {
  user?: User;
  onNavClick: Fn;
  customization?: Customization;
  title?: string;
}

export interface HomeHeaderBarState {
}

export class HomeHeaderBar extends React.Component<HomeHeaderBarProps, HomeHeaderBarState> {


  render() {
    var { user, onNavClick, customization, title } = this.props;

    // One day
    //<div className="icon-button" onClick={this.handleSettings.bind(this)}>
    //  <SvgIcon className="not-implemented" svg={require('../../icons/full-settings.svg')}/>
    //</div>

    var userButton: JSX.Element = null;
    if (user) {
      userButton = <div className="icon-button">
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
    </header>;
  }
}
