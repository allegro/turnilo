'use strict';

import * as React from 'react/addons';
import * as Icon from 'react-svg-icons';
import { List } from 'immutable';
import { $, Expression, Executor, Dataset } from 'plywood';
import { isInside } from '../../utils/dom';
import { DataSource, Clicker } from '../../models/index';
// import { SomeComp } from '../some-comp/some-comp';


interface SideDrawerProps {
  clicker: Clicker;
  dataSources: List<DataSource>;
  selectedDataSource: string;
  onClose: () => void;
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

  componentWillReceiveProps(nextProps: SideDrawerProps) {

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
    var { clicker, onClose } = this.props;
    clicker.changeDataSource(dataSource);
    onClose();
  }

  render() {
    var { onClose, dataSources, selectedDataSource } = this.props;

    var dataSourceItems = dataSources.toArray().map((dataSource) => {
      return JSX(`
        <li
          key={dataSource.name}
          className={dataSource.name === selectedDataSource ? 'selected' : ''}
          onClick={this.selectDataSource.bind(this, dataSource)}
        >{dataSource.title}</li>
      `);
    });

    return JSX(`
      <div className="side-drawer">
        <div className="title" onClick={onClose}>
          <Icon className="combo-logo" name="combo-logo"/>
        </div>
        <ul className="data-sources">{dataSourceItems}</ul>
        <div className="add-data-source">Add dataset</div>
      </div>
    `);
  }
}
