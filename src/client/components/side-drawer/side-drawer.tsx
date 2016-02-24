require('./side-drawer.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { SvgIcon } from '../svg-icon/svg-icon';
import { List } from 'immutable';
import { $, Expression, Executor, Dataset } from 'plywood';
import { ADDITIONAL_LINKS } from '../../config/constants';
import { isInside, escapeKey } from '../../utils/dom/dom';
import { DataSource } from '../../../common/models/index';
// import { SomeComp } from '../some-comp/some-comp';
import { NavList } from '../nav-list/nav-list';


export interface SideDrawerProps extends React.Props<any> {
  changeDataSource: Function;
  selectedDataSource: DataSource;
  dataSources: List<DataSource>;
  onClose: Function;
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

  selectLink(selected: any) {
    if (selected.target) {
      window.open(selected.target);
      return false;
    } else {
      return; // state change for application to handle
    }
  };

  render() {
    var { onClose, selectedDataSource, dataSources } = this.props;

    return <div className="nav side-drawer">
      <div className="logo-cont" onClick={onClose as any}>
        <div className="logo">
          <SvgIcon svg={require('../../icons/pivot-logo.svg')}/>
        </div>
      </div>
      <NavList
        title="Data Cubes"
        className="items"
        selected={selectedDataSource ? selectedDataSource.name : null}
        navItems={dataSources}
        onSelect={this.selectDataSource.bind(this)}
        icon="'../../full-cube.svg'"
      />
      <NavList
        className="items"
        navItems={ADDITIONAL_LINKS}
        onSelect={this.selectLink.bind(this)}
      />
    </div>;
  }
}
