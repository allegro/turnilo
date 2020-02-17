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

import { NamedArray } from "immutable-class";
import * as React from "react";
import { CSSTransition } from "react-transition-group";
import { AppSettings } from "../../../common/models/app-settings/app-settings";
import { DataCube } from "../../../common/models/data-cube/data-cube";
import { Essence } from "../../../common/models/essence/essence";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { ViewSupervisor } from "../../../common/models/view-supervisor/view-supervisor";
import { UrlHashConverter, urlHashConverter } from "../../../common/utils/url-hash-converter/url-hash-converter";
import { Notifications, Questions } from "../../components/notifications/notifications";
import { SideDrawer } from "../../components/side-drawer/side-drawer";
import { AboutModal } from "../../modals/about-modal/about-modal";
import { Ajax } from "../../utils/ajax/ajax";
import { reportError } from "../../utils/error-reporter/error-reporter";
import { createFunctionSlot, FunctionSlot } from "../../utils/function-slot/function-slot";
import { replaceHash } from "../../utils/url/url";
import { CubeView } from "../../views/cube-view/cube-view";
import { ErrorView } from "../../views/error-view/error-view";
import { HomeView } from "../../views/home-view/home-view";
import { NoDataView } from "../../views/no-data-view/no-data-view";
import "./turnilo-application.scss";

export interface TurniloApplicationProps {
  version: string;
  maxFilters?: number;
  appSettings: AppSettings;
  initTimekeeper?: Timekeeper;
}

export interface TurniloApplicationState {
  appSettings?: AppSettings;
  timekeeper?: Timekeeper;
  drawerOpen?: boolean;
  selectedItem?: DataCube;
  viewType?: ViewType;
  viewHash?: string;
  showAboutModal?: boolean;
  cubeViewSupervisor?: ViewSupervisor;
  errorId?: string;
}

export type ViewType = "home" | "cube" | "no-data" | "general-error";

const ERROR: ViewType = "general-error";
export const HOME: ViewType = "home";
export const CUBE: ViewType = "cube";
export const NO_DATA: ViewType = "no-data";

const transitionTimeout = { enter: 500, exit: 300 };

export class TurniloApplication extends React.Component<TurniloApplicationProps, TurniloApplicationState> {
  private hashUpdating = false;
  private readonly sideBarHrefFn: FunctionSlot<string>;
  private readonly urlHashConverter: UrlHashConverter;

  constructor(props: TurniloApplicationProps) {
    super(props);

    this.urlHashConverter = urlHashConverter;
    this.sideBarHrefFn = createFunctionSlot<string>();
    this.state = {
      appSettings: null,
      drawerOpen: false,
      selectedItem: null,
      viewType: null,
      viewHash: null,
      showAboutModal: false,
      errorId: null
    };
  }

  componentDidCatch(error: Error) {
    const errorId = reportError(error);
    this.setState({
      viewType: ERROR,
      errorId
    });
  }

  componentWillMount() {
    const { appSettings, initTimekeeper } = this.props;
    const { dataCubes } = appSettings;

    const hash = window.location.hash;
    let viewType = this.getViewTypeFromHash(hash);

    if (!dataCubes.length) {
      window.location.hash = "";

      this.setState({
        viewType: NO_DATA,
        viewHash: "",
        appSettings
      });

      return;
    }

    const viewHash = this.getViewHashFromHash(hash);

    let selectedItem: DataCube;

    if (this.viewTypeNeedsAnItem(viewType)) {
      selectedItem = this.getSelectedDataCubeFromHash(dataCubes, hash);

      // If datacube / collection does not exist, then bounce to home
      if (!selectedItem) {
        this.changeHash("");
        viewType = HOME;
      }
    }

    if (viewType === HOME && dataCubes.length === 1) {
      viewType = CUBE;
      selectedItem = dataCubes[0];
    }

    this.setState({
      viewType,
      viewHash,
      selectedItem,
      appSettings,
      timekeeper: initTimekeeper || Timekeeper.EMPTY
    });
  }

  viewTypeNeedsAnItem(viewType: ViewType): boolean {
    return viewType === CUBE;
  }

  componentDidMount() {
    window.addEventListener("hashchange", this.globalHashChangeListener);

    Ajax.settingsVersionGetter = () => {
      const { appSettings } = this.state;
      return appSettings.getVersion();
    };
    Ajax.onUpdate = () => {
      console.log("UPDATE!!");
    };

    // There was a clipboard module that did nothing here
    // maybe it should be restored one day
  }

  componentWillUnmount() {
    window.removeEventListener("hashchange", this.globalHashChangeListener);
  }

  globalHashChangeListener = () => {
    if (this.hashUpdating) return;
    this.hashToState(window.location.hash);
  };

  hashToState(hash: string) {
    const { dataCubes } = this.state.appSettings;
    const viewType = this.getViewTypeFromHash(hash);
    const viewHash = this.getViewHashFromHash(hash);
    const newState: TurniloApplicationState = {
      viewType,
      viewHash,
      drawerOpen: false
    };

    if (this.viewTypeNeedsAnItem(viewType)) {
      const item = this.getSelectedDataCubeFromHash(dataCubes, hash);
      newState.selectedItem = item ? item : dataCubes[0];
    } else {
      newState.selectedItem = null;
    }

    this.setState(newState);
  }

  parseHash(hash: string): string[] {
    if (hash[0] === "#") hash = hash.substr(1);
    return hash.split("/");
  }

  getViewTypeFromHash(hash: string): ViewType {
    const appSettings = this.state.appSettings || this.props.appSettings;
    const { dataCubes } = appSettings;
    const viewType = this.parseHash(hash)[0];

    if (!dataCubes || !dataCubes.length) return NO_DATA;

    if (!viewType || viewType === HOME) return HOME;

    if (viewType === NO_DATA) return NO_DATA;

    return CUBE;
  }

  getSelectedDataCubeFromHash(dataCubes: DataCube[], hash: string): DataCube {
    // can change header from hash
    const parts = this.parseHash(hash);
    const dataCubeName = parts[0];

    return NamedArray.findByName(dataCubes, dataCubeName);
  }

  getViewHashFromHash(hash: string): string {
    const parts = this.parseHash(hash);
    if (parts.length < 2) return null;
    parts.shift();
    return parts.join("/");
  }

  sideDrawerOpen = () => {
    this.setState({ drawerOpen: true });
  };

  sideDrawerClose = () => {
    this.setState({ drawerOpen: false });
  };

  changeHash(hash: string, force = false): void {
    this.hashUpdating = true;

    // Hash initialization, no need to add the intermediary url in the history
    if (window.location.hash === `#${hash.split("/")[0]}`) {
      replaceHash("#" + hash);
    } else {
      window.location.hash = `#${hash}`;
    }

    setTimeout(() => this.hashUpdating = false, 5);
    if (force) this.hashToState(hash);
  }

  updateViewHash = (viewHash: string, force = false) => {
    const { viewType } = this.state;

    let newHash: string;
    if (viewType === CUBE) {
      newHash = `${this.state.selectedItem.name}/${viewHash}`;
    } else {
      newHash = viewType;
    }

    this.changeHash(newHash, force);
  };

  getCubeViewHash = (essence: Essence, withPrefix = false): string => {
    const cubeViewHash = this.urlHashConverter.toHash(essence);

    return withPrefix ? this.getUrlPrefix() + cubeViewHash : cubeViewHash;
  };

  getUrlPrefix(baseOnly = false): string {
    const { viewType } = this.state;
    const url = window.location;
    const urlBase = url.origin + url.pathname;
    if (baseOnly) return urlBase;

    let newPrefix: string;
    if (this.viewTypeNeedsAnItem(viewType)) {
      newPrefix = `${this.state.selectedItem.name}/`;
    } else {
      newPrefix = viewType;
    }

    return urlBase + "#" + newPrefix;
  }

  openAboutModal = () => {
    this.setState({
      showAboutModal: true
    });
  };

  onAboutModalClose = () => {
    this.setState({
      showAboutModal: false
    });
  };

  renderAboutModal() {
    const { version } = this.props;
    const { showAboutModal } = this.state;
    if (!showAboutModal) return null;
    return <AboutModal
      version={version}
      onClose={this.onAboutModalClose}
    />;
  }

  renderNotifications() {
    return <Notifications />;
  }

  renderQuestions() {
    return <Questions />;
  }

  renderSideDrawer() {
    const { viewType, selectedItem, appSettings } = this.state;
    const { dataCubes, customization } = appSettings;

    return <SideDrawer
      key="drawer"
      selectedItem={selectedItem}
      dataCubes={dataCubes}
      onOpenAbout={this.openAboutModal}
      onClose={this.sideDrawerClose}
      customization={customization}
      itemHrefFn={this.sideBarHrefFn}
      viewType={viewType}
    />;
  }

  renderSideDrawerTransition() {
    const { drawerOpen } = this.state;
    return <CSSTransition
      in={drawerOpen}
      classNames="side-drawer"
      mountOnEnter={true}
      unmountOnExit={true}
      timeout={transitionTimeout}
    >
      {this.renderSideDrawer()}
    </CSSTransition>;
  }

  renderView() {
    const { maxFilters } = this.props;
    const { viewType, viewHash, selectedItem, appSettings, timekeeper, cubeViewSupervisor, errorId } = this.state;
    const { dataCubes, customization } = appSettings;

    switch (viewType) {
      case NO_DATA:
        return <NoDataView
          onNavClick={this.sideDrawerOpen}
          onOpenAbout={this.openAboutModal}
          customization={customization}
          appSettings={appSettings}
        />;

      case HOME:
        return <HomeView
          dataCubes={dataCubes}
          onNavClick={this.sideDrawerOpen}
          onOpenAbout={this.openAboutModal}
          customization={customization}
        />;

      case CUBE:
        return <CubeView
          dataCube={selectedItem as DataCube}
          initTimekeeper={timekeeper}
          hash={viewHash}
          updateViewHash={this.updateViewHash}
          getCubeViewHash={this.getCubeViewHash}
          getEssenceFromHash={this.urlHashConverter.essenceFromHash}
          maxFilters={maxFilters}
          onNavClick={this.sideDrawerOpen.bind(this, true)}
          customization={customization}
          transitionFnSlot={this.sideBarHrefFn}
          supervisor={cubeViewSupervisor}
        />;

      case ERROR:
        return <ErrorView errorId={errorId} />;

      default:
        throw new Error("unknown view");
    }
  }

  render() {
    return <React.StrictMode>
      <main className="turnilo-application">
        {this.renderView()}
        {this.renderSideDrawerTransition()}
        {this.renderAboutModal()}
        {this.renderNotifications()}
        {this.renderQuestions()}
      </main>
    </React.StrictMode>;
  }
}
