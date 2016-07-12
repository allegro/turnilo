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

import { $ } from 'plywood';
import { DataSourceMock } from "../data-source/data-source.mock";
import { LinkItemMock } from "../link-item/link-item.mock";
import { LinkViewConfig, LinkViewConfigJS, LinkViewConfigContext } from './link-view-config';

export class LinkViewConfigMock {
  public static testOneOnlyJS(): LinkViewConfigJS {
    return {
      title: 'The Links Will Rise Again!',
      linkItems: [
        LinkItemMock.testOneJS()
      ]
    };
  }

  public static testOneTwoJS(): LinkViewConfigJS {
    return {
      title: 'The Links Will Be Reloaded!',
      linkItems: [
        LinkItemMock.testOneJS(),
        LinkItemMock.testTwoJS()
      ]
    };
  }

  static getContext(): LinkViewConfigContext {
    return LinkItemMock.getContext();
  }

  static testOneOnly() {
    return LinkViewConfig.fromJS(LinkViewConfigMock.testOneOnlyJS(), LinkViewConfigMock.getContext());
  }

  static testOneTwo() {
    return LinkViewConfig.fromJS(LinkViewConfigMock.testOneTwoJS(), LinkViewConfigMock.getContext());
  }
}
