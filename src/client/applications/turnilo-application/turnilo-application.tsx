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
import memoizeOne from "memoize-one";
import React from "react";
import { ClientAppSettings } from "../../../common/models/app-settings/app-settings";
import { ClientCustomization } from "../../../common/models/customization/customization";
import { ClientDataCube } from "../../../common/models/data-cube/data-cube";
import { Essence } from "../../../common/models/essence/essence";
import { isEnabled as isOAuthEnabled } from "../../../common/models/oauth/oauth";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { urlHashConverter } from "../../../common/utils/url-hash-converter/url-hash-converter";
import { DataCubeNotFound } from "../../components/no-data/data-cube-not-found";
import { Notifications, Questions } from "../../components/notifications/notifications";
import { SourcesProvider } from "../../components/sources-provider/sources-provider";
import { AboutModal } from "../../modals/about-modal/about-modal";
import { getCode, hasCode, isOauthError, resetToken } from "../../oauth/oauth";
import { OauthCodeHandler } from "../../oauth/oauth-code-handler";
import { OauthMessageView } from "../../oauth/oauth-message-view";
import { Ajax } from "../../utils/ajax/ajax";
import { reportError } from "../../utils/error-reporter/error-reporter";
import { replaceHash } from "../../utils/url/url";
import { ApiContext, CreateApiContext } from "../../views/cube-view/api-context";
import { CubeView } from "../../views/cube-view/cube-view";
import { SettingsContext, SettingsContextValue } from "../../views/cube-view/settings-context";
import { GeneralError } from "../../views/error-view/general-error";
import { HomeView } from "../../views/home-view/home-view";
import "./turnilo-application.scss";
import { cube, generalError, home, oauthCodeHandler, oauthMessageView, View } from "./view";

export interface TurniloApplicationProps {
  version: string;
  maxFilters?: number;
  appSettings: ClientAppSettings;
  initTimekeeper?: Timekeeper;
}

export interface TurniloApplicationState {
  timekeeper?: Timekeeper;
  drawerOpen?: boolean;
  view: View;
  showAboutModal?: boolean;
}

export class TurniloApplication extends React.Component<TurniloApplicationProps, TurniloApplicationState> {
  private hashUpdating = false;
  state: TurniloApplicationState = {
    drawerOpen: false,
    view: null,
    showAboutModal: false
  };

  componentDidCatch(error: Error) {
    if (!!this.props.appSettings.oauth && isOauthError(error)) {
      resetToken();
      this.setState({
        view: oauthMessageView(error)
      });
      return;
    }
    this.setState({
      view: generalError(reportError(error))
    });
  }

  UNSAFE_componentWillMount() {
    const { initTimekeeper, appSettings: { oauth } } = this.props;

    if (!!oauth && hasCode()) {
      this.setState({
        view: oauthCodeHandler(getCode())
      });
      return;
    }
    const timekeeper = initTimekeeper || Timekeeper.EMPTY;
    this.setState({ timekeeper });
    this.hashToState(window.location.hash);
  }

  componentDidMount() {
    window.addEventListener("hashchange", this.globalHashChangeListener);

    Ajax.settingsVersionGetter = () => {
      const { version } = this.props;
      return Number(version);
    };
  }

  componentWillUnmount() {
    window.removeEventListener("hashchange", this.globalHashChangeListener);
  }

  globalHashChangeListener = () => {
    if (this.hashUpdating) return;
    this.hashToState(window.location.hash);
  };

  hashToState(hash: string) {
    const normalizedHash = hash.startsWith("#") ? hash.substr(1) : hash;
    const view = this.getViewFromHash(normalizedHash);
    this.setState({
      view,
      drawerOpen: false
    });
  }

  parseCubeHash(hash: string): { cubeName: string, definition: string } {
    const [cubeName, ...rest] = hash.split("/");
    const definition = rest.join("/");
    return { cubeName, definition };
  }

  getViewFromHash(hash: string): View {
    if (hash === "") return home;

    const { cubeName, definition } = this.parseCubeHash(hash);
    return cube(cubeName, definition);
  }

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

  updateCubeAndEssenceInHash = (dataCube: ClientDataCube, essence: Essence, force: boolean) => {
    const newHash = `${dataCube.name}/${(urlHashConverter.toHash(essence))}`;
    this.changeHash(newHash, force);
  };

  urlForEssence = (dataCube: ClientDataCube, essence: Essence): string => {
    return `${this.getUrlPrefix()}#${dataCube.name}/${(urlHashConverter.toHash(essence))}`;
  };

  getUrlPrefix(): string {
    const { origin, pathname } = window.location;
    return `${origin}${pathname}`;
  }

  openAboutModal = () => this.setState({ showAboutModal: true });

  onAboutModalClose = () => this.setState({ showAboutModal: false });

  renderAboutModal() {
    const { version } = this.props;
    const { showAboutModal } = this.state;
    if (!showAboutModal) return null;
    return <AboutModal
      version={version}
      onClose={this.onAboutModalClose}
    />;
  }

  renderView() {
    const { maxFilters, appSettings } = this.props;
    const { customization } = appSettings;
    const { view, timekeeper } = this.state;

    switch (view.viewType) {
      case "oauth-message": {
        const oauth = appSettings.oauth;
        if (!isOAuthEnabled(oauth)) throw new Error("Expected OAuth to be enabled in configuration.");
        return <OauthMessageView oauth={oauth}/>;
      }

      case "home":
        return <SourcesProvider
          appSettings={appSettings}>
          {({ sources }) =>
            <HomeView onOpenAbout={this.openAboutModal}
                      customization={customization}
                      dataCubes={sources.dataCubes}/>}
        </SourcesProvider>;

      case "cube":
        return <SourcesProvider appSettings={appSettings}>
          {({ sources }) => {
            const dataCube = NamedArray.findByName(sources.dataCubes, view.cubeName);
            if (dataCube === undefined) {
              return <DataCubeNotFound customization={customization}/>;
            }
            return <CubeView
              key={view.cubeName}
              dataCube={dataCube}
              dataCubes={sources.dataCubes}
              appSettings={appSettings}
              initTimekeeper={timekeeper}
              hash={view.hash}
              changeCubeAndEssence={this.updateCubeAndEssenceInHash}
              urlForCubeAndEssence={this.urlForEssence}
              getEssenceFromHash={urlHashConverter.essenceFromHash}
              openAboutModal={this.openAboutModal}
              maxFilters={maxFilters}
              customization={customization}
            />;
          }}
        </SourcesProvider>;

      case "general-error":
        return <GeneralError errorId={view.errorId}/>;

      case "oauth-code-handler": {
        const oauth = appSettings.oauth;
        if (!isOAuthEnabled(oauth)) throw new Error("Expected OAuth to be enabled in configuration.");
        return <OauthCodeHandler oauth={oauth} code={view.code}/>;
      }
    }
  }

  private getSettingsContext(): SettingsContextValue {
    const { appSettings: { customization } } = this.props;
    return this.constructSettingsContext(customization);
  }

  // NOTE: is memoization needed?
  private constructSettingsContext = memoizeOne((customization: ClientCustomization) => ({ customization }));

  render() {
    return <React.StrictMode>
      <main className="turnilo-application">
        <SettingsContext.Provider value={this.getSettingsContext()}>
          <CreateApiContext appSettings={this.props.appSettings}>
            {this.renderView()}
            {this.renderAboutModal()}
            <Notifications/>
            <Questions/>
          </CreateApiContext>
        </SettingsContext.Provider>
      </main>
    </React.StrictMode>;
  }
}
