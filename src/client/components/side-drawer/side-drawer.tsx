import MouseEventHandler = __React.MouseEventHandler;
'use strict';
require('./side-drawer.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { SvgIcon } from '../svg-icon/svg-icon';
import { List } from 'immutable';
import { $, Expression, Executor, Dataset } from 'plywood';
import { isInside, escapeKey } from '../../utils/dom/dom';
import { DataSource } from '../../../common/models/index';
// import { SomeComp } from '../some-comp/some-comp';
import { NavList } from '../nav-list/nav-list';


export interface SideDrawerProps extends React.Props<any> {
  changeDataSource: Function;
  selectedDataSource: DataSource;
  dataSources: List<DataSource>;
  onClose: Function;
  homeLink?: string;
}

export interface SideDrawerState {
}

export class SideDrawer extends React.Component<SideDrawerProps, SideDrawerState> {

  constructor() {
    super();
    // this.state = {};
    this.globalMouseDownListener = this.globalMouseDownListener.bind(this);
    this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
  }

  componentDidMount() {
    window.addEventListener('mousedown', this.globalMouseDownListener);
    window.addEventListener('keydown', this.globalKeyDownListener);
  }

  componentWillUnmount() {
    window.removeEventListener('mousedown', this.globalMouseDownListener);
    window.removeEventListener('keydown', this.globalKeyDownListener);
  }

  globalMouseDownListener(e: MouseEvent) {
    var myElement = ReactDOM.findDOMNode(this);
    var target = e.target as Element;

    if (isInside(target, myElement)) return;
    this.props.onClose();
  }

  globalKeyDownListener(e: KeyboardEvent) {
    if (!escapeKey(e)) return;
    this.props.onClose();
  }

  selectDataSource(dataSource: DataSource) {
    var { changeDataSource, onClose } = this.props;
    changeDataSource(dataSource);
    onClose();
  }

  render() {
    var { onClose, homeLink, selectedDataSource, dataSources } = this.props;

    var homeLinkElement: JSX.Element = null;
    if (homeLink) {
      homeLinkElement = <a className="home-link" href={homeLink}>
        <SvgIcon svg={require('../../icons/home.svg')}/>
        Home
      </a>;
    }

    return <div className="nav side-drawer">
      <div className="logo-cont" onClick={onClose as any}>
        <div className="logo">
          <SvgIcon svg={require('../../icons/pivot-logo.svg')}/>
        </div>
      </div>

      <NavList
        title="Data Cubes"
        className="items"
        selected={selectedDataSource.name}
        navItems={dataSources}
        onSelect={this.selectDataSource.bind(this)}
        icon="'../../full-cube.svg'"

      />

      {homeLinkElement}
    </div>;
  }
}
