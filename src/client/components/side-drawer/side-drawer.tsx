require('./side-drawer.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { List } from 'immutable';
import { ADDITIONAL_LINKS } from '../../config/constants';
import { isInside, escapeKey } from '../../utils/dom/dom';
import { DataSource } from '../../../common/models/index';
import { NavLogo } from '../nav-logo/nav-logo';
import { NavList } from '../nav-list/nav-list';
import { AboutModal } from '../about-modal/about-modal';


export interface SideDrawerProps extends React.Props<any> {
  selectedDataSource: DataSource;
  dataSources: List<DataSource>;
  onClose: Function;
}

export interface SideDrawerState {
  showAboutModal?: boolean;
}

export class SideDrawer extends React.Component<SideDrawerProps, SideDrawerState> {

  constructor() {
    super();
    this.state = {
      showAboutModal: false
    };

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
    if (this.state.showAboutModal) return;

    var myElement = ReactDOM.findDOMNode(this);
    var target = e.target as Element;

    if (isInside(target, myElement)) return;
    this.props.onClose();
  }

  globalKeyDownListener(e: KeyboardEvent) {
    if (!escapeKey(e)) return;
    this.props.onClose();
  }

  openAboutModal() {
    this.setState({
      showAboutModal: true
    });
  }

  onAboutModalClose() {
    this.setState({
      showAboutModal: false
    });
  }

  renderAboutModal() {
    const { showAboutModal } = this.state;
    if (!showAboutModal) return;
    return <AboutModal onClose={this.onAboutModalClose.bind(this)}/>;
  }

  render() {
    var { onClose, selectedDataSource, dataSources } = this.props;

    var onLogoClick = (e: React.MouseEvent) => {
      if (e.altKey) {
        this.openAboutModal();
        return;
      }
      onClose();
    };

    var navLinks = dataSources.toArray().map(ds => {
      return {
        name: ds.name,
        title: ds.title,
        href: '#' + ds.name
      };
    });

    return <div className="side-drawer">
      <NavLogo onClick={onLogoClick}/>
      <NavList
        title="Data Cubes"
        selected={selectedDataSource ? selectedDataSource.name : null}
        navLinks={navLinks}
        iconSvg={require('../../icons/full-cube.svg')}
      />
      <NavList
        navLinks={ADDITIONAL_LINKS}
      />
      {this.renderAboutModal()}
    </div>;
  }
}
