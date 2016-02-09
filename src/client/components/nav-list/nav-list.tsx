'use strict';
require('./nav-list.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { DataSource, Filter, Dimension, Measure } from '../../../common/models/index';
// import { ... } from '../../config/constants';
import { SvgIcon } from '../svg-icon/svg-icon';

// I am: import { NavList } from '../nav-list/nav-list';
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
  constructor() {
    super();
    // this.state = {};
  }

  getItemClassName(itemName: string) {
    var itemClass = "item";
    if (this.props.selected && this.props.selected === itemName) return `${itemClass} selected`;
    if (itemName === "settings") return `${itemClass} not-implemented`;
    return itemClass;
  }

  renderIcon(path: string): any {
    if (!path) return "";
    return (<span className="icon">
      <SvgIcon svg={require('../../icons/full-cube.svg')}/>
    </span>);
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
    var groupClassName = "group";
    var titleSection = <section className="group-title">{this.props.title}
      <ul className="icons not-implemented">
        <li className="icon">
          <SvgIcon svg={require('../../icons/full-add.svg')}/>
        </li>
        <li className="icon">
          <SvgIcon svg={require('../../icons/full-settings.svg')}/>
        </li>
      </ul>
    </section>;
    if (!this.props.title) {
      titleSection = null;
      groupClassName += " no-title";
    }
    return (
      <section className={groupClassName}>
        {titleSection}
        <ul className="items">
          { this.renderNavList() }
        </ul>
      </section>
    );
  };
}
;

