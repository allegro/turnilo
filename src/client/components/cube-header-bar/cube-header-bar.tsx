require('./cube-header-bar.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { SvgIcon } from '../svg-icon/svg-icon';
import { $, Expression, Datum, Dataset } from 'plywood';
import { Essence, DataSource, User, Stage } from "../../../common/models/index";

import { BubbleMenu } from '../bubble-menu/bubble-menu';
import { Modal } from '../modal/modal';

export interface CubeHeaderBarProps extends React.Props<any> {
  dataSource: DataSource;
  user?: User;
  onNavClick: Function;
  getUrlPrefix?: Function;
}

export interface CubeHeaderBarState {
  showTestMenu?: boolean;
  autoRefreshMenuOpenOn?: Element;
}

export class CubeHeaderBar extends React.Component<CubeHeaderBarProps, CubeHeaderBarState> {

  constructor() {
    super();
    this.state = {
      showTestMenu: false,
      autoRefreshMenuOpenOn: null
    };
  }

  onPanicClick(e: MouseEvent) {
    var { dataSource, getUrlPrefix } = this.props;
    if (e.altKey) {
      console.log('DataSource:', dataSource.toJS());
      return;
    }
    if (e.shiftKey) {
      this.setState({
        showTestMenu: true
      });
      return;
    }
    window.location.assign(getUrlPrefix(true));
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

  onAutoRefreshClick(e: MouseEvent) {
    this.setState({
      autoRefreshMenuOpenOn: e.target as Element
    });
  }

  onAutoRefreshClose() {
    this.setState({
      autoRefreshMenuOpenOn: null
    });
  }

  renderAutoRefreshMenu() {
    const { autoRefreshMenuOpenOn } = this.state;
    if (!autoRefreshMenuOpenOn) return null;

    var stage = Stage.fromSize(300, 200);
    return <BubbleMenu
      className="refresh-menu"
      direction="down"
      stage={stage}
      openOn={autoRefreshMenuOpenOn}
      onClose={this.onAutoRefreshClose.bind(this)}
    >
      lol
    </BubbleMenu>;
  }

  render() {
    var { user, onNavClick, dataSource } = this.props;

    var userButton: JSX.Element = null;
    if (user) {
      userButton = <div className="icon-button">
        <SvgIcon svg={require('../../icons/full-user.svg')}/>
      </div>;
    }

    return <header className="cube-header-bar">
      <div className="left-bar" onClick={onNavClick as any}>
        <div className="menu-icon">
          <SvgIcon svg={require('../../icons/menu.svg')}/>
        </div>
        <div className="title">{dataSource.title}</div>
      </div>
      <div className="right-bar">
        <div className="icon-button panic" onClick={this.onPanicClick.bind(this)}>
          <SvgIcon className="panic-icon" svg={require('../../icons/panic.svg')}/>
        </div>
        <a className="icon-button help" href="https://groups.google.com/forum/#!forum/imply-user-group" target="_blank">
          <SvgIcon className="help-icon" svg={require('../../icons/help.svg')}/>
        </a>
        <a className="icon-button github" href="https://github.com/implydata/pivot" target="_blank">
          <SvgIcon className="github-icon" svg={require('../../icons/github.svg')}/>
        </a>
        <div className="icon-button auto-refresh" onClick={this.onAutoRefreshClick.bind(this)}>
          <SvgIcon className="github-icon" svg={require('../../icons/github.svg')}/>
        </div>
        {userButton}
      </div>
      {this.renderTestModal()}
      {this.renderAutoRefreshMenu()}
    </header>;
  }
}
