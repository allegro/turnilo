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

import axios from "axios";
import { Dataset, DatasetJS, Environment, Executor, Expression } from "plywood";
import { ClientAppSettings } from "../../../common/models/app-settings/app-settings";
import { isEnabled, Oauth } from "../../../common/models/oauth/oauth";
import { ClientSources, SerializedSources } from "../../../common/models/sources/sources";
import { deserialize } from "../../deserializers/sources";
import { getToken, mapOauthError } from "../../oauth/oauth";

export interface AjaxOptions {
  method: "GET" | "POST";
  url: string;
  timeout: number;
  data?: any;
}

const validateStatus = (s: number) => 200 <= s && s < 300 || s === 304;

export class Ajax {
  static version: string;

  static settingsVersionGetter: () => number;

  static headers(oauth: Oauth) {
    if (!isEnabled(oauth)) return {};
    const headerName = oauth.tokenHeaderName;
    const token = getToken();
    return !token ? {} : {
      [headerName]: getToken()
    };
  }

  static query<T>({ data, url, timeout, method }: AjaxOptions, oauth?: Oauth): Promise<T> {
    if (data) {
      if (Ajax.version) data.version = Ajax.version;
      if (Ajax.settingsVersionGetter) data.settingsVersion = Ajax.settingsVersionGetter();
    }

    const headers = Ajax.headers(oauth);
    return axios({ method, url, data, timeout, validateStatus, headers })
      .then(res => {
        return res.data;
      })
      .catch(error => {
        throw mapOauthError(oauth, error);
      });
  }

  static queryUrlExecutorFactory(dataCubeName: string, { oauth, clientTimeout: timeout }: ClientAppSettings): Executor {
    return (ex: Expression, env: Environment = {}) => {
      const method = "POST";
      const url = "plywood";
      const timezone = env ? env.timezone : null;
      const data = { dataCube: dataCubeName, expression: ex.toJS(), timezone };
      return Ajax.query<{ result: DatasetJS }>({ method, url, timeout, data }, oauth)
        .then(res => Dataset.fromJS(res.result));
    };
  }

  static sources(appSettings: ClientAppSettings): Promise<ClientSources> {
    const headers = Ajax.headers(appSettings.oauth);
    return axios.get<SerializedSources>("sources", { headers })
      .then(resp => resp.data)
      .catch(error => {
        throw mapOauthError(appSettings.oauth, error);
      })
      .then(sourcesJS => deserialize(sourcesJS, appSettings));
  }
}
