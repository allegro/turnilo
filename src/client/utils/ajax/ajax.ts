/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import * as Q from 'q';
import * as Qajax from 'qajax';
import { $, Expression, Executor, Dataset, ChainExpression, SplitAction, Environment } from 'plywood';

Qajax.defaults.timeout = 0; // We'll manage the timeout per request.

function getSplitsDescription(ex: Expression): string {
  var splits: string[] = [];
  ex.forEach((ex) => {
    if (ex instanceof ChainExpression) {
      ex.actions.forEach((action) => {
        if (action instanceof SplitAction) {
          splits.push(action.firstSplitExpression().toString());
        }
      });
    }
  });
  return splits.join(';');
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
  method: 'GET' | 'POST';
  url: string;
  data?: any;
}

export class Ajax {
  static version: string;

  static settingsVersionGetter: () => number;
  static onUpdate: () => void;

  static query(options: AjaxOptions): Q.Promise<any> {
    var data = options.data;

    if (data) {
      if (Ajax.version) data.version = Ajax.version;
      if (Ajax.settingsVersionGetter) data.settingsVersion = Ajax.settingsVersionGetter();
    }

    return Qajax({
      method: options.method,
      url: options.url,
      data
    })
      .timeout(60000)
      .then(Qajax.filterSuccess)
      .then(Qajax.toJSON)
      .then((res) => {
        if (res && res.action === 'update' && Ajax.onUpdate) Ajax.onUpdate();
        return res;
      })
      .catch((xhr: XMLHttpRequest | Error): Dataset => {
        if (!xhr) return null; // TS needs this
        if (xhr instanceof Error) {
          throw new Error('client timeout');
        } else {
          var jsonError = parseOrNull(xhr.responseText);
          if (jsonError) {
            if (jsonError.action === 'reload') {
              reload();
            } else if (jsonError.action === 'update' && Ajax.onUpdate) {
              Ajax.onUpdate();
            }
            throw new Error(jsonError.message || jsonError.error);
          } else {
            throw new Error(xhr.responseText);
          }
        }
      });
  }

  static queryUrlExecutorFactory(name: string, url: string): Executor {
    return (ex: Expression, env: Environment = {}) => {
      return Ajax.query({
        method: "POST",
        url: url + '?by=' + getSplitsDescription(ex),
        data: {
          dataCube: name,
          expression: ex.toJS(),
          timezone: env ? env.timezone : null
        }
      }).then((res) => Dataset.fromJS(res.result));
    };
  }
}
