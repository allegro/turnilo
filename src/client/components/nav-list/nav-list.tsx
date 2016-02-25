require('./nav-list.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { DataSource, Filter, Dimension, Measure } from '../../../common/models/index';
// import { ... } from '../../config/constants';
import { SvgIcon } from '../svg-icon/svg-icon';

import { List } from 'immutable';

export interface NavListProps extends React.Props<any> {
  title?: string;
  navItems: List<any>;
  onSelect?: Function;
  icon?: string;
  className: string;
  selected?: string;
}

export interface NavListState {
}

export class NavList extends React.Component< NavListProps, NavListState> {

  getItemClassName(itemName: string) {
    var { selected } = this.props;
    var itemClass = "item";
    if (selected && selected === itemName) return `${itemClass} selected`;
    if (itemName === "settings") return `${itemClass} not-implemented`;
    return itemClass;
  }

  renderIcon(path: string): any {
    if (!path) return null;
    return <span className="icon">
      <SvgIcon svg={require('../../icons/full-cube.svg')}/>
    </span>;
  }

  renderNavList() {
    return this.props.navItems.map((navItem) => {
      return <li
        className={this.getItemClassName(navItem.name)}
        key={navItem.name}
        onClick={this.props.onSelect.bind(this, navItem)}
      >
        {this.renderIcon(this.props.icon)}
        {navItem.title}
      </li>;
    });
  }

  render() {
    const { title } = this.props;

    var className = "nav-list";
    var titleSection: JSX.Element = null;
    if (title) {
      titleSection = <div className="group-title">
        {title}
        <ul className="icons not-implemented">
          <li className="icon">
            <SvgIcon svg={require('../../icons/full-add.svg')}/>
          </li>
          <li className="icon">
            <SvgIcon svg={require('../../icons/full-settings.svg')}/>
          </li>
        </ul>
      </div>;
    } else {
      className += " no-title";
    }

    return <div className={className}>
      {titleSection}
      <ul className="items">
        { this.renderNavList() }
      </ul>
    </div>;
  };
}
