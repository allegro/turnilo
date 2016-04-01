require('./home-header-bar.css');

import * as React from 'react';
import { Fn } from "../../../common/utils/general/general";
import { Stage, Clicker, User } from '../../../common/models/index';
import { SvgIcon } from '../svg-icon/svg-icon';

export interface HomeHeaderBarProps extends React.Props<any> {
  user?: User;
  onNavClick: Fn;
}

export interface HomeHeaderBarState {
}

export class HomeHeaderBar extends React.Component<HomeHeaderBarProps, HomeHeaderBarState> {


  render() {
    var { user, onNavClick } = this.props;

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

    return <header className="home-header-bar">
      <div className="left-bar" onClick={onNavClick as any}>
        <div className="menu-icon">
          <SvgIcon svg={require('../../icons/menu.svg')}/>
        </div>
        <div className="title">Home</div>
      </div>
      <div className="right-bar">
        <a className="icon-button help" href="https://groups.google.com/forum/#!forum/imply-user-group" target="_blank">
          <SvgIcon className="help-icon" svg={require('../../icons/help.svg')}/>
        </a>
        <a className="icon-button github" href="https://github.com/implydata/pivot" target="_blank">
          <SvgIcon className="github-icon" svg={require('../../icons/github.svg')}/>
        </a>
        {userButton}
      </div>
    </header>;
  }
}
