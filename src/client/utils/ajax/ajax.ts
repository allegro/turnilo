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
import { SerializedCluster } from "../../../common/models/cluster/cluster";
import { SerializedDataCube } from "../../../common/models/data-cube/data-cube";
import { isEnabled, Oauth } from "../../../common/models/oauth/oauth";
import { ClientSources } from "../../../common/models/sources/sources";
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

  static async fetchClusters(headers: Record<string, string>): Promise<SerializedCluster[]> {
    return axios.get("sources/clusters", { headers }).then(resp => resp.data);
  }

  static async fetchDataCubes(headers: Record<string, string>): Promise<SerializedDataCube[]> {
    async function* fetchDataCubesPage(page: number): AsyncIterableIterator<SerializedDataCube[]> {
      const { dataCubes, next } = (await axios.get(`sources/dataCubes?page=${page}`, { headers })).data;
      yield dataCubes;
      if (next) {
        yield* fetchDataCubesPage(next);
      }

    }

    async function* fetchAllPages() {
      yield* fetchDataCubesPage(0);
    }

    const dataCubes: SerializedDataCube[] = [];
    for await (const cubes of fetchAllPages()) {
      dataCubes.push(...cubes);
    }

    return dataCubes;
  }

  static async sources(appSettings: ClientAppSettings): Promise<ClientSources> {
    try {
      const headers = Ajax.headers(appSettings.oauth);
      const clusters = Ajax.fetchClusters(headers);
      const dataCubes = Ajax.fetchDataCubes(headers);

      return deserialize({
        clusters: await clusters,
        dataCubes: await dataCubes
      }, appSettings);
    } catch (e) {
      throw mapOauthError(appSettings.oauth, e);
    }
  }
}
