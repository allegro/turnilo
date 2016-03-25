require('./nav-list.css');

import * as React from 'react';
import { SvgIcon } from '../svg-icon/svg-icon';

export interface NavLink {
  name: string;
  title: string;
  href: string;
  newTab?: boolean;
}

export interface NavListProps extends React.Props<any> {
  title?: string;
  navLinks: NavLink[];
  iconSvg?: string;
  selected?: string;
}

export interface NavListState {
}

export class NavList extends React.Component< NavListProps, NavListState> {

  getItemClassName(itemName: string) {
    var { selected } = this.props;
    var itemClass = "item";
    if (selected && selected === itemName) return `${itemClass} selected`;
    return itemClass;
  }

  renderIcon(iconSvg: string): any {
    if (!iconSvg) return null;
    return <span className="icon">
      <SvgIcon svg={iconSvg}/>
    </span>;
  }

  renderNavList() {
    const { navLinks, iconSvg, selected } = this.props;
    return navLinks.map((navLink) => {
      var itemClass = "item";
      if (selected && selected === navLink.name) itemClass += ' selected';
      return <a
        className={itemClass}
        key={navLink.name}
        href={navLink.href}
        target={navLink.newTab ? '_blank' : null}
      >
        {this.renderIcon(iconSvg)}
        {navLink.title}
      </a>;
    });
  }

  render() {
    const { title } = this.props;

    var className = "nav-list";
    var titleSection: JSX.Element = null;
    if (title) {
      titleSection = <div className="group-title">{title}</div>;
    } else {
      className += " no-title";
    }

    return <div className={className}>
      {titleSection}
      <div className="items">
        {this.renderNavList()}
      </div>
    </div>;
  };
}
