require('./cube-header-bar.css');

import * as React from 'react';
import { immutableEqual } from "immutable-class";
import { Duration } from 'chronoshift';
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
  autoRefreshRate?: Duration;
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
      autoRefreshRate: null,
      userMenuOpenOn: null
    };
  }

  componentDidMount() {
    const { dataSource } = this.props.essence;
    this.setAutoRefreshFromDataSource(dataSource);
  }

  componentWillReceiveProps(nextProps: CubeHeaderBarProps) {
    if (this.props.essence.dataSource.name !== nextProps.essence.dataSource.name) {
      this.setAutoRefreshFromDataSource(nextProps.essence.dataSource);
    }
  }

  componentWillUnmount() {
    this.clearTimerIfExists();
  }

  setAutoRefreshFromDataSource(dataSource: DataSource) {
    const { refreshRule } = dataSource;
    if (refreshRule.isFixed()) return;
    this.setAutoRefreshRate(refreshRule.refresh);
  }

  setAutoRefreshRate(rate: Duration) {
    const { autoRefreshRate } = this.state;
    if (immutableEqual(autoRefreshRate, rate)) return;

    this.clearTimerIfExists();

    // Make new timer
    var { refreshMaxTime } = this.props;
    if (refreshMaxTime && rate) {
      this.autoRefreshTimer = setInterval(() => {
        refreshMaxTime();
      }, rate.getCanonicalLength());
    }

    this.setState({
      autoRefreshRate: rate
    });
  }

  clearTimerIfExists() {
    if (this.autoRefreshTimer) {
      clearInterval(this.autoRefreshTimer);
      this.autoRefreshTimer = null;
    }
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

  // Share menu ("hiluk" = share in Hebrew, kind of)

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
    const { essence, getUrlPrefix } = this.props;
    const { hilukMenuOpenOn } = this.state;
    if (!hilukMenuOpenOn) return null;

    return <HilukMenu
      essence={essence}
      openOn={hilukMenuOpenOn}
      onClose={this.onHilukMenuClose.bind(this)}
      getUrlPrefix={getUrlPrefix}
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
    const { refreshMaxTime, essence } = this.props;
    const { autoRefreshMenuOpenOn, autoRefreshRate } = this.state;
    if (!autoRefreshMenuOpenOn) return null;

    return <AutoRefreshMenu
      openOn={autoRefreshMenuOpenOn}
      onClose={this.onAutoRefreshMenuClose.bind(this)}
      autoRefreshRate={autoRefreshRate}
      setAutoRefreshRate={this.setAutoRefreshRate.bind(this)}
      refreshMaxTime={refreshMaxTime}
      dataSource={essence.dataSource}
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
        {userButton}
      </div>
      {this.renderTestModal()}
      {this.renderHilukMenu()}
      {this.renderAutoRefreshMenu()}
      {this.renderUserMenu()}
    </header>;
  }
}
