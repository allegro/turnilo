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

import React from "react";
import { ClientAppSettings } from "../../../common/models/app-settings/app-settings";
import { ClientSources } from "../../../common/models/sources/sources";
import { Unary } from "../../../common/utils/functional/functional";
import { Ajax } from "../../utils/ajax/ajax";
import { Loader } from "../loader/loader";
import { MessagePanel } from "../message-panel/message-panel";

enum SourcesRequestStatus { LOADED, LOADING, ERROR }

interface SourcesRequestBase {
  status: SourcesRequestStatus;
}

interface SourcesRequestLoading extends SourcesRequestBase {
  status: SourcesRequestStatus.LOADING;
}

interface SourcesRequestLoaded extends SourcesRequestBase {
  status: SourcesRequestStatus.LOADED;
  sources: ClientSources;
}

interface SourcesRequestLoadError extends SourcesRequestBase {
  status: SourcesRequestStatus.ERROR;
  error: Error;
}

type SourcesRequest = SourcesRequestLoading | SourcesRequestLoadError | SourcesRequestLoaded;

const loading: SourcesRequest = { status: SourcesRequestStatus.LOADING };
const loaded = (sources: ClientSources): SourcesRequest => ({
  status: SourcesRequestStatus.LOADED,
  sources
});
const errored = (error: Error): SourcesRequest => ({
  status: SourcesRequestStatus.ERROR,
  error
});

interface SourcesProviderProps {
  appSettings: ClientAppSettings;
  children: Unary<{ sources: ClientSources }, React.ReactNode>;
}

interface SourcesProviderState {
  sourcesRequest: SourcesRequest;
}

export class SourcesProvider extends React.Component<SourcesProviderProps, SourcesProviderState> {

  state: SourcesProviderState = { sourcesRequest: loading };

  componentDidMount() {
    Ajax.sources(this.props.appSettings)
      .then(sources => {
        this.setState({
          sourcesRequest: loaded(sources)
        });
      })
      .catch(error => {
        this.setState({
          sourcesRequest: errored(error)
        });
      });
  }

  render() {
    const { sourcesRequest } = this.state;
    switch (sourcesRequest.status) {
      case SourcesRequestStatus.LOADING:
        return <MessagePanel title="Loading data sources...">
          <Loader/>
        </MessagePanel>;
      case SourcesRequestStatus.ERROR:
        throw sourcesRequest.error;
      case SourcesRequestStatus.LOADED:
        return this.props.children({ sources: sourcesRequest.sources });
    }
  }
}
