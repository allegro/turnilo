require('./side-drawer.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { List } from 'immutable';
import { Fn } from '../../../common/utils/general/general';
import { STRINGS } from '../../config/constants';
import { isInside, escapeKey } from '../../utils/dom/dom';
import { DataSource, Customization } from '../../../common/models/index';
import { NavLogo } from '../nav-logo/nav-logo';
import { SvgIcon } from '../svg-icon/svg-icon';
import { NavList } from '../nav-list/nav-list';

export interface SideDrawerProps extends React.Props<any> {
  selectedDataSource: DataSource;
  dataSources: List<DataSource>;
  onOpenAbout: Fn;
  onClose: Fn;
  customization?: Customization;
  showOverviewLink?: boolean;
}

export interface SideDrawerState {
}

export class SideDrawer extends React.Component<SideDrawerProps, SideDrawerState> {

  constructor() {
    super();
    //this.state = {};

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

  onHomeClick() {
    window.location.hash = '#';
  }

  renderOverviewLink() {
    const { showOverviewLink } = this.props;
    if (!showOverviewLink) return null;
    return <div className="home-link" onClick={this.onHomeClick.bind(this)}>
      <SvgIcon svg={require('../../icons/home.svg')}/>
      <span>Overview</span>
    </div>;
  }

  render() {
    var { onClose, selectedDataSource, dataSources, onOpenAbout, customization } = this.props;

    var navLinks = dataSources.toArray().map(ds => {
      return {
        name: ds.name,
        title: ds.title,
        href: '#' + ds.name
      };
    });

    var infoAndFeedback = [{
      name: 'info',
      title: STRINGS.infoAndFeedback,
      onClick: () => {
        onClose();
        onOpenAbout();
      }
    }];

    var customLogoSvg: string = null;
    if (customization && customization.customLogoSvg) {
      customLogoSvg = customization.customLogoSvg;
    }

    return <div className="side-drawer">
      <NavLogo customLogoSvg={customLogoSvg} onClick={onClose}/>
      {this.renderOverviewLink()}
      <NavList
        title="Data Cubes"
        selected={selectedDataSource ? selectedDataSource.name : null}
        navLinks={navLinks}
        iconSvg={require('../../icons/full-cube.svg')}
      />
      <NavList
        navLinks={infoAndFeedback}
      />
    </div>;
  }
}
