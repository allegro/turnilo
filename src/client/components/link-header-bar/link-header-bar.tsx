require('./link-header-bar.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { SvgIcon } from '../svg-icon/svg-icon';
import { $, Expression, Datum, Dataset } from 'plywood';
import { Essence, DataSource, User } from "../../../common/models/index";

import { Modal } from '../modal/modal';

export interface LinkHeaderBarProps extends React.Props<any> {
  title: string;
  user?: User;
  onNavClick: Function;
  onExploreClick: Function;
  getUrlPrefix?: Function;
}

export interface LinkHeaderBarState {
}

export class LinkHeaderBar extends React.Component<LinkHeaderBarProps, LinkHeaderBarState> {

  constructor() {
    super();
    //this.state = {};
  }

  render() {
    var { title, user, onNavClick, onExploreClick } = this.props;

    var userButton: JSX.Element = null;
    if (user) {
      userButton = <div className="icon-button">
        <SvgIcon svg={require('../../icons/full-user.svg')}/>
      </div>;
    }

    return <header className="link-header-bar">
      <div className="left-bar" onClick={onNavClick as any}>
        <div className="menu-icon">
          <SvgIcon svg={require('../../icons/menu.svg')}/>
        </div>
        <div className="title">{title}</div>
      </div>
      <div className="right-bar">
        <div className="text-button" onClick={onExploreClick as any}>Explore</div>
        <a className="icon-button help" href="https://groups.google.com/forum/#!forum/imply-user-group" target="_blank">
          <SvgIcon className="help-icon" svg={require('../../icons/help.svg')}/>
        </a>
        {userButton}
      </div>
    </header>;
  }
}
