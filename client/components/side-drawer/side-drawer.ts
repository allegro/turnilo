'use strict';

import * as React from 'react/addons';
import * as Icon from 'react-svg-icons';
import { List } from 'immutable';
import { $, Expression, Executor, Dataset } from 'plywood';
import { isInside } from '../../utils/dom';
import { DataSource, Clicker, Essence } from '../../models/index';
// import { SomeComp } from '../some-comp/some-comp';


interface SideDrawerProps {
  clicker: Clicker;
  essence: Essence;
  onClose: Function;
}

interface SideDrawerState {
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
    var myElement = React.findDOMNode(this);
    var target = <Element>e.target;

    if (isInside(target, myElement)) return;
    this.props.onClose();
  }

  globalKeyDownListener(event: KeyboardEvent) {
    if (event.which !== 27) return; // 27 = escape
    this.props.onClose();
  }

  selectDataSource(dataSource: DataSource) {
    var { clicker, essence, onClose } = this.props;
    if (essence.dataSource === dataSource) {
      window.location.assign(Essence.getBaseURL());
    } else {
      clicker.changeDataSource(dataSource);
    }
    onClose();
  }

  renderDataSourceItems() {
    var { essence } = this.props;

    var selectedDataSource = essence.dataSource;
    return essence.dataSources.map((dataSource) => {
      return JSX(`
        <li
          className={dataSource === selectedDataSource ? 'selected' : ''}
          key={dataSource.name}
          onClick={this.selectDataSource.bind(this, dataSource)}
        >{dataSource.title}</li>
      `);
    });
  }

  render() {
    var { onClose } = this.props;

    return JSX(`
      <div className="side-drawer">
        <div className="title" onClick={onClose}>
          <Icon className="combo-logo" name="combo-logo"/>
        </div>
        <ul className="data-sources">{this.renderDataSourceItems()}</ul>
      </div>
    `);
  }
}
