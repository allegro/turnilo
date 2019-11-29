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
import { ChainableExpression, Dataset, DatasetJS, Environment, Executor, Expression, SplitExpression } from "plywood";
import { Cluster } from "../../../common/models/cluster/cluster";
import { DataCube } from "../../../common/models/data-cube/data-cube";

function getSplitsDescription(ex: Expression): string {
  var splits: string[] = [];
  ex.forEach(ex => {
    if (ex instanceof ChainableExpression) {
      ex.getArgumentExpressions().forEach(action => {
        if (action instanceof SplitExpression) {
          splits.push(action.firstSplitExpression().toString());
        }
      });
    }
  });
  return splits.join(";");
}

const CLIENT_TIMEOUT_DELTA = 5000;

function clientTimeout(cluster: Cluster): number {
  const clusterTimeout = cluster ? cluster.getTimeout() : 0;
  return clusterTimeout + CLIENT_TIMEOUT_DELTA;
}

var reloadRequested = false;

function reload() {
  if (reloadRequested) return;
  reloadRequested = true;
  window.location.reload(true);
}

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
  static onUpdate: () => void;

  static query<T>({ data, url, timeout, method }: AjaxOptions): Promise<T> {
    if (data) {
      if (Ajax.version) data.version = Ajax.version;
      if (Ajax.settingsVersionGetter) data.settingsVersion = Ajax.settingsVersionGetter();
    }

    return axios({ method, url, data, timeout, validateStatus })
      .then(res => {
        if (res && res.data.action === "update" && Ajax.onUpdate) Ajax.onUpdate();
        return res.data;
      })
      .catch(error => {
        if (error.response && error.response.data) {
          if (error.response.data.action === "reload") {
            reload();
          } else if (error.response.data.action === "update" && Ajax.onUpdate) {
            Ajax.onUpdate();
          }
          throw new Error("error with response: " + error.response.status + ", " + error.message);
        } else if (error.request) {
          throw new Error("no response received, " + error.message);
        } else {
          throw new Error(error.message);
        }
      });
  }

  static queryUrlExecutorFactory({ name, cluster }: DataCube): Executor {
    const timeout = clientTimeout(cluster);
    return (ex: Expression, env: Environment = {}) => {
      const method = "POST";
      const url = `plywood?by=${getSplitsDescription(ex)}`;
      const timezone = env ? env.timezone : null;
      const data = { dataCube: name, expression: ex.toJS(), timezone };
      return Ajax.query<{result: DatasetJS}>({ method, url, timeout, data })
        .then(res => Dataset.fromJS(res.result));
    };
  }
}
