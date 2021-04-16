/*
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

import * as React from "react";
import { AppSettings } from "../../../common/models/app-settings/app-settings";
import { Unary } from "../../../common/utils/functional/functional";
import { Loader } from "../../components/loader/loader";
import { MessagePanel } from "../../components/message-panel/message-panel";
import { Ajax } from "../../utils/ajax/ajax";

enum SettingsResourceStatus { LOADED, LOADING, ERROR }

interface SettingsResourceBase {
  status: SettingsResourceStatus;
}

interface SettingsResourceLoading extends SettingsResourceBase {
  status: SettingsResourceStatus.LOADING;
}

interface SettingsResourceLoaded extends SettingsResourceBase {
  status: SettingsResourceStatus.LOADED;
  settings: AppSettings;
}

interface SettingsResourceLoadError extends SettingsResourceBase {
  status: SettingsResourceStatus.ERROR;
  error: Error;
}

type SettingsResource = SettingsResourceLoading | SettingsResourceLoadError | SettingsResourceLoaded;

const loading: SettingsResource = { status: SettingsResourceStatus.LOADING };
const loaded = (settings: AppSettings): SettingsResource => ({
  status: SettingsResourceStatus.LOADED,
  settings
});
const errored = (error: Error): SettingsResource => ({
  status: SettingsResourceStatus.ERROR,
  error
});

interface AppSettingsProviderProps {
  clientAppSettings: AppSettings;
  children: Unary<{ appSettings: AppSettings }, React.ReactNode>;
}

interface AppSettingsProviderState {
  appSettings: SettingsResource;
}

export class AppSettingsProvider extends React.Component<AppSettingsProviderProps, AppSettingsProviderState> {

  state: AppSettingsProviderState = { appSettings: loading };

  componentDidMount() {
    Ajax.settings(this.props.clientAppSettings)
      .then(appSettings => {
        this.setState({
          appSettings: loaded(appSettings)
        });
      })
      .catch(error => {
        this.setState({
          appSettings: errored(error)
        });
      });
  }

  render() {
    const { appSettings } = this.state;
    switch (appSettings.status) {
      case SettingsResourceStatus.LOADING:
        return <MessagePanel title="Loading data sources...">
          <Loader/>
        </MessagePanel>;
      case SettingsResourceStatus.ERROR:
        throw appSettings.error;
      case SettingsResourceStatus.LOADED:
        return this.props.children({ appSettings: appSettings.settings });
    }
  }
}
