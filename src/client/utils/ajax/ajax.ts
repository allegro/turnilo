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

import { ChainableExpression, Dataset, Environment, Executor, Expression, SplitExpression } from "plywood";
import * as Qajax from "qajax";
import { Cluster } from "../../../common/models/cluster/cluster";
import { DataCube } from "../../../common/models/data-cube/data-cube";

Qajax.defaults.timeout = 0; // We'll manage the timeout per request.

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

function parseOrNull(json: any): any {
  try {
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

export interface AjaxOptions {
  method: "GET" | "POST";
  url: string;
  timeout: number;
  data?: any;
}

export class Ajax {
  static version: string;

  static settingsVersionGetter: () => number;
  static onUpdate: () => void;

  static query({ data, url, timeout, method }: AjaxOptions): Promise<any> {
    if (data) {
      if (Ajax.version) data.version = Ajax.version;
      if (Ajax.settingsVersionGetter) data.settingsVersion = Ajax.settingsVersionGetter();
    }

    return Qajax({ method, url, data })
      .timeout(timeout)
      .then(Qajax.filterSuccess)
      .then(Qajax.toJSON)
      .then(res => {
        if (res && res.action === "update" && Ajax.onUpdate) Ajax.onUpdate();
        return res;
      })
      .catch((xhr: XMLHttpRequest | Error): Dataset => {
        if (!xhr) return null; // TS needs this
        if (xhr instanceof Error) {
          throw new Error("client timeout");
        } else {
          var jsonError = parseOrNull(xhr.responseText);
          if (jsonError) {
            if (jsonError.action === "reload") {
              reload();
            } else if (jsonError.action === "update" && Ajax.onUpdate) {
              Ajax.onUpdate();
            }
            throw new Error(jsonError.message || jsonError.error);
          } else {
            throw new Error(xhr.responseText || "connection fail");
          }
        }
      }) as any;
  }

  static queryUrlExecutorFactory({ name, cluster }: DataCube): Executor {
    const timeout = clientTimeout(cluster);
    return (ex: Expression, env: Environment = {}) => {
      const method = "POST";
      const url = `plywood?by=${getSplitsDescription(ex)}`;
      const timezone = env ? env.timezone : null;
      const data = { dataCube: name, expression: ex.toJS(), timezone };
      return Ajax.query({ method, url, timeout, data })
        .then(res => Dataset.fromJS(res.result));
    };
  }
}
