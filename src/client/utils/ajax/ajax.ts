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
import axios from "axios";

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

var reloadRequested = false;

function reload() {
  if (reloadRequested) return;
  reloadRequested = true;
  window.location.reload(true);
}

export interface AjaxOptions {
  method: "GET" | "POST";
  url: string;
  data?: any;
}

export class Ajax {
  static version: string;

  static settingsVersionGetter: () => number;
  static onUpdate: () => void;

  static query(options: AjaxOptions): Promise<any> {
    var data = options.data;

    if (data) {
      if (Ajax.version) data.version = Ajax.version;
      if (Ajax.settingsVersionGetter) data.settingsVersion = Ajax.settingsVersionGetter();
    }

    return axios({
      method: options.method,
      url: options.url,
      // Qajax's filterSuccess also allows 304s, axios by default does not
      validateStatus: (s) => s >= 200 && s < 300 || s === 304,
      timeout: 60000,
      data
    })
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
      }) as any;
  }

  static queryUrlExecutorFactory(name: string, url: string): Executor {
    return (ex: Expression, env: Environment = {}) => {
      return Ajax.query({
        method: "POST",
        url: url + "?by=" + getSplitsDescription(ex),
        data: {
          dataCube: name,
          expression: ex.toJS(),
          timezone: env ? env.timezone : null
        }
      }).then(res => Dataset.fromJS(res.result));
    };
  }
}
