/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2019 Allegro.pl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from "react";
import { Fn } from "../../../common/utils/general/general";
import { classNames } from "../../utils/dom/dom";
import { SvgIcon } from "../svg-icon/svg-icon";
import "./nav-list.scss";

export interface NavLink {
  name: string;
  title: string;
  href: string;
  newTab?: boolean;
  tooltip?: string;
}

export interface NavAction {
  name: string;
  title: string;
  onClick: Fn;
  tooltip?: string;
}

export type NavItem = NavLink | NavAction;

function isNavLink(item: NavItem): item is NavLink {
  return "href" in item;
}

export interface NavListProps {
  title?: string;
  navLinks: NavItem[];
  iconSvg?: string;
  selected?: string;
}

function renderIcon(iconSvg: string): JSX.Element {
  return iconSvg ? <span className="icon"><SvgIcon svg={iconSvg} /></span> : null;
}

function renderLink({ name, title, href, newTab, tooltip }: NavLink, icon: string, selected: boolean): JSX.Element {
  const target = newTab ? "_blank" : null;
  const className = classNames("item", { selected });
  return <a className={className} href={href} title={tooltip} target={target} key={name}>
    {renderIcon(icon)}
    {title}
  </a>;
}

function renderAction({ name, title, onClick, tooltip }: NavAction, icon: string, selected: boolean): JSX.Element {
  const className = classNames("item", { selected });
  return <div className={className} title={tooltip} key={name} onClick={onClick}>
    {renderIcon(icon)}
    {title}
  </div>;
}

function renderItem(item: NavItem, iconSvg: string, selectedName: string): JSX.Element {
  const selected = selectedName && selectedName === item.name;
  return isNavLink(item) ? renderLink(item, iconSvg, selected) : renderAction(item, iconSvg, selected);
}

export const NavList: React.FunctionComponent<NavListProps> = ({ title, navLinks, iconSvg, selected }) => {
  return <div className={classNames("nav-list", { "no-title": !title })}>
    {title && <div className="group-title">{title}</div>}
    <div className="items">
      {navLinks.map(navLink => renderItem(navLink, iconSvg, selected))}
    </div>
  </div>;
};
