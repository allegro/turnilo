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

import { Duration, Timezone } from "chronoshift";
import { immutableEqual } from "immutable-class";
import React from "react";
import { Clicker } from "../../../../common/models/clicker/clicker";
import { ClientCustomization } from "../../../../common/models/customization/customization";
import { Essence } from "../../../../common/models/essence/essence";
import { Timekeeper } from "../../../../common/models/timekeeper/timekeeper";
import { Binary } from "../../../../common/utils/functional/functional";
import { Fn } from "../../../../common/utils/general/general";
import { AutoRefreshMenu } from "../../../components/auto-refresh-menu/auto-refresh-menu";
import { DebugMenu } from "../../../components/debug-menu/debug-menu";
import { InfoBubble } from "../../../components/info-bubble/info-bubble";
import { ShareMenu } from "../../../components/share-menu/share-menu";
import { SvgIcon } from "../../../components/svg-icon/svg-icon";
import { TimezoneMenu } from "../../../components/timezone-menu/timezone-menu";
import { classNames } from "../../../utils/dom/dom";
import "./cube-header-bar.scss";

export interface CubeHeaderBarProps {
  clicker: Clicker;
  essence: Essence;
  timekeeper: Timekeeper;
  onNavClick: Fn;
  urlForEssence: (essence: Essence) => string;
  refreshMaxTime?: Fn;
  updatingMaxTime?: boolean;
  openRawDataModal?: Fn;
  openViewDefinitionModal?: Fn;
  openDruidQueryModal?: Fn;
  openUrlShortenerModal?: Binary<string, string, void>;
  customization?: ClientCustomization;
  changeTimezone?: (timezone: Timezone) => void;
}

export interface CubeHeaderBarState {
  shareMenuAnchor?: Element;
  autoRefreshMenuAnchor?: Element;
  autoRefreshRate?: Duration;
  timezoneMenuAnchor?: Element;
  debugMenuAnchor?: Element;
  animating?: boolean;
}

export class CubeHeaderBar extends React.Component<CubeHeaderBarProps, CubeHeaderBarState> {
  public mounted: boolean;
  private autoRefreshTimer: number;

  state: CubeHeaderBarState = {
    shareMenuAnchor: null,
    autoRefreshMenuAnchor: null,
    autoRefreshRate: null,
    timezoneMenuAnchor: null,
    debugMenuAnchor: null,
    animating: false
  };

  componentDidMount() {
    this.mounted = true;
  }

  UNSAFE_componentWillReceiveProps(nextProps: CubeHeaderBarProps) {
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

  setAutoRefreshRate = (rate: Duration) => {
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
  };

  clearTimerIfExists() {
    if (this.autoRefreshTimer) {
      clearInterval(this.autoRefreshTimer);
      this.autoRefreshTimer = null;
    }
  }

  toggleShareMenu = (e: React.MouseEvent<Element>) => {
    const { shareMenuAnchor } = this.state;
    shareMenuAnchor ? this.closeShareMenu() : this.openShareMenu(e.currentTarget);
  };

  openShareMenu = (anchor: Element) => this.setState({ shareMenuAnchor: anchor });

  closeShareMenu = () => this.setState({ shareMenuAnchor: null });

  renderShareMenu() {
    const { customization, essence, timekeeper, openUrlShortenerModal, urlForEssence } = this.props;
    const { shareMenuAnchor } = this.state;
    if (!shareMenuAnchor) return null;

    return <ShareMenu
      essence={essence}
      openUrlShortenerModal={openUrlShortenerModal}
      timekeeper={timekeeper}
      openOn={shareMenuAnchor}
      onClose={this.closeShareMenu}
      customization={customization}
      urlForEssence={urlForEssence}
    />;
  }

  toggleAutoRefreshMenu = (e: React.MouseEvent<Element>) => {
    const { autoRefreshMenuAnchor } = this.state;
    autoRefreshMenuAnchor ? this.closeAutoRefreshMenu() : this.openAutoRefreshMenu(e.currentTarget);
  };

  openAutoRefreshMenu = (anchor: Element) => this.setState({ autoRefreshMenuAnchor: anchor });

  closeAutoRefreshMenu = () => this.setState({ autoRefreshMenuAnchor: null });

  renderAutoRefreshMenu() {
    const { refreshMaxTime, essence: { dataCube, timezone }, timekeeper } = this.props;
    const { autoRefreshMenuAnchor, autoRefreshRate } = this.state;
    if (!autoRefreshMenuAnchor) return null;

    return <AutoRefreshMenu
      timekeeper={timekeeper}
      openOn={autoRefreshMenuAnchor}
      onClose={this.closeAutoRefreshMenu}
      autoRefreshRate={autoRefreshRate}
      setAutoRefreshRate={this.setAutoRefreshRate}
      refreshMaxTime={refreshMaxTime}
      dataCube={dataCube}
      timezone={timezone}
    />;
  }

  toggleTimezoneMenu = (e: React.MouseEvent<Element>) => {
    const { timezoneMenuAnchor } = this.state;
    timezoneMenuAnchor ? this.closeTimezoneMenu() : this.openTimezoneMenu(e.currentTarget);
  };

  openTimezoneMenu = (anchor: Element) => this.setState({ timezoneMenuAnchor: anchor });

  closeTimezoneMenu = () => this.setState({ timezoneMenuAnchor: null });

  renderTimezoneMenu() {
    const { changeTimezone, essence: { timezone }, customization } = this.props;
    const { timezoneMenuAnchor } = this.state;
    if (!timezoneMenuAnchor) return null;

    return <TimezoneMenu
      timezone={timezone}
      timezones={customization.timezones}
      changeTimezone={changeTimezone}
      openOn={timezoneMenuAnchor}
      onClose={this.closeTimezoneMenu}
    />;
  }

  toggleDebugMenu = (e: React.MouseEvent<Element>) => {
    const { debugMenuAnchor } = this.state;
    debugMenuAnchor ? this.closeDebugMenu() : this.openDebugMenu(e.currentTarget);
  };

  openDebugMenu = (anchor: Element) => this.setState({ debugMenuAnchor: anchor });

  closeDebugMenu = () => this.setState({ debugMenuAnchor: null });

  renderDebugMenu() {
    const { debugMenuAnchor } = this.state;
    if (!debugMenuAnchor) return null;

    const { essence: { dataCube }, openRawDataModal, openViewDefinitionModal, openDruidQueryModal } = this.props;
    return <DebugMenu
      dataCube={dataCube}
      openRawDataModal={openRawDataModal}
      openDruidQueryModal={openDruidQueryModal}
      openViewDefinitionModal={openViewDefinitionModal}
      openOn={debugMenuAnchor}
      onClose={this.closeDebugMenu} />;
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
      {this.renderShareMenu()}
      {this.renderAutoRefreshMenu()}
      {this.renderTimezoneMenu()}
      {this.renderDebugMenu()}
    </header>;
  }

  private renderRightBar(): JSX.Element {
    return <div className="right-bar">
      <div className="text-button" onClick={this.toggleTimezoneMenu}>
        {this.props.essence.timezone.toString()}
      </div>
      <div className={classNames("icon-button", "auto-refresh", { refreshing: this.state.animating })} onClick={this.toggleAutoRefreshMenu}>
        <SvgIcon svg={require("../../../icons/full-refresh.svg")} />
      </div>
      <div className="icon-button" onClick={this.toggleShareMenu}>
        <SvgIcon svg={require("../../../icons/full-hiluk.svg")} />
      </div>
      <div className="icon-button" onClick={this.toggleDebugMenu}>
        <SvgIcon svg={require("../../../icons/full-settings.svg")} />
      </div>
    </div>;
  }

  private renderLeftBar() {
    const { onNavClick, essence: { dataCube } } = this.props;
    return <div className="left-bar">
      <div className="menu-icon" onClick={onNavClick}>
        <SvgIcon svg={require("../../../icons/menu.svg")} />
      </div>
      <div className="title" onClick={onNavClick}>{dataCube.title}</div>
      {dataCube.description && <InfoBubble
        className="cube-description"
        description={dataCube.description}
        extendedDescription={dataCube.extendedDescription}
      />}
    </div>;
  }
}
