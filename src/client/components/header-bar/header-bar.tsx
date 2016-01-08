'use strict';
require('./header-bar.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { SvgIcon } from '../svg-icon/svg-icon';
import { $, Expression, Datum, Dataset } from 'plywood';
import { Essence } from "../../../common/models/index";

import { Modal } from '../modal/modal';

export interface HeaderBarProps extends React.Props<any> {
  essence: Essence;
  onNavClick: React.MouseEventHandler;
  showLastUpdated?: boolean;
  hideGitHubIcon?: boolean;
  color?: string;
}

export interface HeaderBarState {
  showTestMenu?: boolean;
}

export class HeaderBar extends React.Component<HeaderBarProps, HeaderBarState> {

  constructor() {
    super();
    this.state = {
      showTestMenu: false
    };
  }

  onPanicClick(e: MouseEvent) {
    if (e.altKey) {
      var { essence } = this.props;
      console.log('Filter:', essence.filter.toJS());
      console.log('DataSource:', essence.dataSource.toJS());
      return;
    }
    if (e.shiftKey) {
      this.setState({
        showTestMenu: true
      });
      return;
    }
    window.location.assign(Essence.getBaseURL());
  }

  onModalClose() {
    this.setState({
      showTestMenu: false
    });
  }

  renderTestModal() {
    if (!this.state.showTestMenu) return null;
    return <Modal
      className="test-modal"
      title="Test Modal"
      onClose={this.onModalClose.bind(this)}
    >
      <div>Hello 1</div>
      <div>Hello 2</div>
      <div>Hello 3</div>
    </Modal>;
  }

  render() {
    var { essence, onNavClick, showLastUpdated, hideGitHubIcon, color } = this.props;
    var { dataSource } = essence;

    var updated: JSX.Element = null;
    if (showLastUpdated) {
      var updatedText = dataSource.updatedText();
      if (updatedText) {
        updated = <div className="last-updated">{updatedText}</div>;
      }
    }

    var gitHubIcon: JSX.Element = null;
    if (!hideGitHubIcon) {
      gitHubIcon = <a className="icon-button github" href="https://github.com/implydata/pivot" target="_blank">
        <SvgIcon className="github-icon" svg={require('../../icons/github.svg')}/>
      </a>;
    }

    var headerStyle: React.CSSProperties = null;
    if (color) {
      headerStyle = { background: color };
    }

    return <header className="header-bar" style={headerStyle}>
      <div className="burger-bar" onClick={onNavClick}>
        <SvgIcon className="menu" svg={require('../../icons/menu.svg')}/>
        <div className="dataset-title">{dataSource.title}</div>
      </div>
      <div className="right-bar">
        {updated}
        <div className="icon-button panic" onClick={this.onPanicClick.bind(this)}>
          <SvgIcon className="panic-icon" svg={require('../../icons/panic.svg')}/>
        </div>
        <a className="icon-button help" href="https://groups.google.com/forum/#!forum/imply-user-group" target="_blank">
          <SvgIcon className="help-icon" svg={require('../../icons/help.svg')}/>
        </a>
        {gitHubIcon}
      </div>
      {this.renderTestModal()}
    </header>;
  }
}
