require('./cube-header-bar.css');

import * as React from 'react';
import { SvgIcon } from '../svg-icon/svg-icon';
import { Clicker, Essence, DataSource, User } from "../../../common/models/index";

import { Modal } from '../modal/modal';
import { HilukMenu } from '../hiluk-menu/hiluk-menu';
import { AutoRefreshMenu } from '../auto-refresh-menu/auto-refresh-menu';
import { UserMenu } from '../user-menu/user-menu';


export interface CubeHeaderBarProps extends React.Props<any> {
  clicker: Clicker;
  essence: Essence;
  user?: User;
  onNavClick: Function;
  getUrlPrefix?: Function;
  refreshMaxTime?: Function;
}

export interface CubeHeaderBarState {
  showTestMenu?: boolean;
  hilukMenuOpenOn?: Element;
  autoRefreshMenuOpenOn?: Element;
  autoRefreshRate?: number;
  userMenuOpenOn?: Element;
}

export class CubeHeaderBar extends React.Component<CubeHeaderBarProps, CubeHeaderBarState> {
  private autoRefreshTimer: NodeJS.Timer;

  constructor() {
    super();
    this.state = {
      showTestMenu: false,
      hilukMenuOpenOn: null,
      autoRefreshMenuOpenOn: null,
      userMenuOpenOn: null
    };
  }

  componentDidMount() {
    this.setAutoRefreshRate(5);
  }

  setAutoRefreshRate(rate: number) {
    if (this.state.autoRefreshRate === rate) return;

    // CLear existing timer if exists
    if (this.autoRefreshTimer) {
      clearInterval(this.autoRefreshTimer);
      this.autoRefreshTimer = null;
    }

    // Make new timer
    var { refreshMaxTime } = this.props;
    if (refreshMaxTime && rate) {
      this.autoRefreshTimer = setInterval(() => {
        refreshMaxTime();
      }, rate * 60000);

      this.setState({
        autoRefreshRate: rate
      });
    }
  }

  onPanicClick(e: MouseEvent) {
    var { essence, getUrlPrefix } = this.props;
    var { dataSource } = essence;
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

  // Share menu ("hiluk" = share in Hebrew)

  onHilukMenuClick(e: MouseEvent) {
    const { hilukMenuOpenOn } = this.state;
    if (hilukMenuOpenOn) return this.onHilukMenuClose();
    this.setState({
      hilukMenuOpenOn: e.target as Element
    });
  }

  onHilukMenuClose() {
    this.setState({
      hilukMenuOpenOn: null
    });
  }

  renderHilukMenu() {
    const { hilukMenuOpenOn } = this.state;
    if (!hilukMenuOpenOn) return null;

    return <HilukMenu
      openOn={hilukMenuOpenOn}
      onClose={this.onHilukMenuClose.bind(this)}
    />;
  }

  // Auto Refresh menu

  onAutoRefreshMenuClick(e: MouseEvent) {
    const { autoRefreshMenuOpenOn } = this.state;
    if (autoRefreshMenuOpenOn) return this.onAutoRefreshMenuClose();
    this.setState({
      autoRefreshMenuOpenOn: e.target as Element
    });
  }

  onAutoRefreshMenuClose() {
    this.setState({
      autoRefreshMenuOpenOn: null
    });
  }

  renderAutoRefreshMenu() {
    const { refreshMaxTime } = this.props;
    const { autoRefreshMenuOpenOn, autoRefreshRate } = this.state;
    if (!autoRefreshMenuOpenOn) return null;

    return <AutoRefreshMenu
      openOn={autoRefreshMenuOpenOn}
      onClose={this.onAutoRefreshMenuClose.bind(this)}
      autoRefreshRate={autoRefreshRate}
      setAutoRefreshRate={this.setAutoRefreshRate.bind(this)}
      refreshMaxTime={refreshMaxTime}
    />;
  }

  // User menu

  onUserMenuClick(e: MouseEvent) {
    const { userMenuOpenOn } = this.state;
    if (userMenuOpenOn) return this.onUserMenuClose();
    this.setState({
      userMenuOpenOn: e.target as Element
    });
  }

  onUserMenuClose() {
    this.setState({
      userMenuOpenOn: null
    });
  }

  renderUserMenu() {
    const { user } = this.props;
    const { userMenuOpenOn } = this.state;
    if (!userMenuOpenOn) return null;

    return <UserMenu
      openOn={userMenuOpenOn}
      onClose={this.onUserMenuClose.bind(this)}
      user={user}
    />;
  }

  render() {
    var { user, onNavClick, essence } = this.props;

    var userButton: JSX.Element = null;
    if (user) {
      userButton = <div className="icon-button user" onClick={this.onUserMenuClick.bind(this)}>
        <SvgIcon svg={require('../../icons/full-user.svg')}/>
      </div>;
    }

    return <header className="cube-header-bar">
      <div className="left-bar" onClick={onNavClick as any}>
        <div className="menu-icon">
          <SvgIcon svg={require('../../icons/menu.svg')}/>
        </div>
        <div className="title">{essence.dataSource.title}</div>
      </div>
      <div className="right-bar">
        <div className="icon-button auto-refresh" onClick={this.onAutoRefreshMenuClick.bind(this)}>
          <SvgIcon className="auto-refresh-icon" svg={require('../../icons/full-refresh.svg')}/>
        </div>
        <div className="icon-button hiluk" onClick={this.onHilukMenuClick.bind(this)}>
          <SvgIcon className="hiluk-icon" svg={require('../../icons/full-hiluk.svg')}/>
        </div>
        <div className="icon-button panic" onClick={this.onPanicClick.bind(this)}>
          <SvgIcon className="panic-icon" svg={require('../../icons/panic.svg')}/>
        </div>
        {userButton}
      </div>
      {this.renderTestModal()}
      {this.renderHilukMenu()}
      {this.renderAutoRefreshMenu()}
      {this.renderUserMenu()}
    </header>;
  }
}
