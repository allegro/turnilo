/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2018 Allegro.pl
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

import { Duration, Timezone } from "chronoshift";
import { immutableEqual } from "immutable-class";
import { Dataset } from "plywood";
import * as React from "react";
import { Clicker, Customization, DataCube, Essence, ExternalView, Timekeeper, User } from "../../../../common/models";
import { Fn } from "../../../../common/utils";
import { AutoRefreshMenu, HilukMenu, SettingsMenu, SvgIcon, UserMenu } from "../../../components";
import { InfoBubble } from "../../../components/info-bubble/info-bubble";
import { classNames } from "../../../utils/dom/dom";
import "./cube-header-bar.scss";

export interface CubeHeaderBarProps {
  clicker: Clicker;
  essence: Essence;
  timekeeper: Timekeeper;
  user?: User;
  onNavClick: Fn;
  getCubeViewHash?: (essence: Essence, withPrefix?: boolean) => string;
  refreshMaxTime?: Fn;
  updatingMaxTime?: boolean;
  openRawDataModal?: Fn;
  openViewDefinitionModal?: Fn;
  customization?: Customization;
  getDownloadableDataset?: () => Dataset;
  addEssenceToCollection?: () => void;
  changeTimezone?: (timezone: Timezone) => void;
  timezone?: Timezone;
  stateful: boolean;
}

export interface CubeHeaderBarState {
  hilukMenuOpenOn?: Element;
  autoRefreshMenuOpenOn?: Element;
  autoRefreshRate?: Duration;
  settingsMenuOpenOn?: Element;
  userMenuOpenOn?: Element;
  animating?: boolean;
}

export class CubeHeaderBar extends React.Component<CubeHeaderBarProps, CubeHeaderBarState> {
  public mounted: boolean;
  private autoRefreshTimer: number;

  constructor(props: CubeHeaderBarProps) {
    super(props);
    this.state = {
      hilukMenuOpenOn: null,
      autoRefreshMenuOpenOn: null,
      autoRefreshRate: null,
      settingsMenuOpenOn: null,
      userMenuOpenOn: null,
      animating: false
    };
  }

  componentDidMount() {
    this.mounted = true;
    const { dataCube } = this.props.essence;
    this.setAutoRefreshFromDataCube(dataCube);
  }

  componentWillReceiveProps(nextProps: CubeHeaderBarProps) {
    if (this.props.essence.dataCube.name !== nextProps.essence.dataCube.name) {
      this.setAutoRefreshFromDataCube(nextProps.essence.dataCube);
    }

    if (!this.props.updatingMaxTime && nextProps.updatingMaxTime) {
      this.setState({ animating: true });
      setTimeout(() => {
        if (!this.mounted) return;
        this.setState({ animating: false });
      }, 1000);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
    this.clearTimerIfExists();
  }

  setAutoRefreshFromDataCube(dataCube: DataCube) {
    const { refreshRule } = dataCube;
    if (refreshRule.isFixed()) return;
    this.setAutoRefreshRate(Duration.fromJS("PT5M")); // ToDo: make this configurable maybe?
  }

  setAutoRefreshRate(rate: Duration) {
    const { autoRefreshRate } = this.state;
    if (immutableEqual(autoRefreshRate, rate)) return;

    this.clearTimerIfExists();

    // Make new timer
    const { refreshMaxTime } = this.props;
    if (refreshMaxTime && rate) {
      this.autoRefreshTimer = window.setInterval(() => {
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
    const { essence, timekeeper, getCubeViewHash, customization, openRawDataModal, openViewDefinitionModal, getDownloadableDataset, addEssenceToCollection, stateful } = this.props;
    const { hilukMenuOpenOn } = this.state;
    if (!hilukMenuOpenOn) return null;

    let externalViews: ExternalView[] = null;
    if (customization && customization.externalViews) {
      externalViews = customization.externalViews;
    }

    let onAddEssenceToCollectionClick: any = null;
    if (stateful) {
      onAddEssenceToCollectionClick = () => {
        this.setState({
          hilukMenuOpenOn: null
        });
        addEssenceToCollection();
      };
    }

    return <HilukMenu
      essence={essence}
      timekeeper={timekeeper}
      openOn={hilukMenuOpenOn}
      onClose={this.onHilukMenuClose.bind(this)}
      getCubeViewHash={getCubeViewHash}
      openRawDataModal={openRawDataModal}
      openViewDefinitionModal={openViewDefinitionModal}
      externalViews={externalViews}
      getDownloadableDataset={getDownloadableDataset}
      addEssenceToCollection={onAddEssenceToCollectionClick}
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
    const { refreshMaxTime, essence, timekeeper } = this.props;
    const { autoRefreshMenuOpenOn, autoRefreshRate } = this.state;
    if (!autoRefreshMenuOpenOn) return null;

    return <AutoRefreshMenu
      timekeeper={timekeeper}
      openOn={autoRefreshMenuOpenOn}
      onClose={this.onAutoRefreshMenuClose.bind(this)}
      autoRefreshRate={autoRefreshRate}
      setAutoRefreshRate={this.setAutoRefreshRate.bind(this)}
      refreshMaxTime={refreshMaxTime}
      dataCube={essence.dataCube}
      timezone={essence.timezone}
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
    const { user, customization } = this.props;
    const { userMenuOpenOn } = this.state;
    if (!userMenuOpenOn) return null;

    return <UserMenu
      openOn={userMenuOpenOn}
      onClose={this.onUserMenuClose.bind(this)}
      user={user}
      customization={customization}
    />;
  }

  // Settings menu

  onSettingsMenuClick(e: MouseEvent) {
    const { settingsMenuOpenOn } = this.state;
    if (settingsMenuOpenOn) return this.onSettingsMenuClose();

    if (e.metaKey && e.altKey) {
      console.log(this.props.essence.toJS());
      return;
    }

    this.setState({
      settingsMenuOpenOn: e.target as Element
    });
  }

  onSettingsMenuClose() {
    this.setState({
      settingsMenuOpenOn: null
    });
  }

  renderSettingsMenu() {
    const { changeTimezone, timezone, customization, essence, user, stateful } = this.props;
    const { settingsMenuOpenOn } = this.state;
    if (!settingsMenuOpenOn) return null;

    return <SettingsMenu
      dataCube={essence.dataCube}
      user={user}
      timezone={timezone}
      timezones={customization.getTimezones()}
      changeTimezone={changeTimezone}
      openOn={settingsMenuOpenOn}
      onClose={this.onSettingsMenuClose.bind(this)}
      stateful={stateful}
    />;
  }

  render() {
    const { customization } = this.props;

    let headerStyle: React.CSSProperties = null;
    if (customization && customization.headerBackground) {
      headerStyle = {
        background: customization.headerBackground
      };
    }

    return <header className="cube-header-bar" style={headerStyle}>
      {this.renderLeftBar()}
      {this.renderRightBar()}
      {this.renderHilukMenu()}
      {this.renderAutoRefreshMenu()}
      {this.renderSettingsMenu()}
      {this.renderUserMenu()}
    </header>;
  }

  private renderRightBar(): JSX.Element {
    return <div className="right-bar">
      <div className={classNames("icon-button", "auto-refresh", { refreshing: this.state.animating })} onClick={this.onAutoRefreshMenuClick.bind(this)}>
        <SvgIcon className="auto-refresh-icon" svg={require("../../../icons/full-refresh.svg")}/>
      </div>
      <div className="icon-button hiluk" onClick={this.onHilukMenuClick.bind(this)}>
        <SvgIcon className="hiluk-icon" svg={require("../../../icons/full-hiluk.svg")}/>
      </div>
      <div className="icon-button settings" onClick={this.onSettingsMenuClick.bind(this)}>
        <SvgIcon className="settings-icon" svg={require("../../../icons/full-settings.svg")}/>
      </div>
      {this.props.user && <div className="icon-button user" onClick={this.onUserMenuClick.bind(this)}>
        <SvgIcon svg={require("../../../icons/full-user.svg")}/>
      </div>}
    </div>;
  }

  private renderLeftBar() {
    const { onNavClick, essence: { dataCube } } = this.props;
    return <div className="left-bar">
      <div className="menu-icon" onClick={onNavClick}>
        <SvgIcon svg={require("../../../icons/menu.svg")}/>
      </div>
      <div className="title" onClick={onNavClick}>{dataCube.title}</div>
      {dataCube.description && <InfoBubble className="cube-description" description={dataCube.description}/>}
    </div>;
  }
}
