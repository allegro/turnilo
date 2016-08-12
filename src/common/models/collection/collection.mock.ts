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
import { DataCubeMock } from "../data-cube/data-cube.mock";
import { CollectionItemMock } from "../collection-item/collection-item.mock";
import { Collection, CollectionJS, CollectionContext } from './collection';

export class CollectionMock {
  public static testOneOnlyJS(): CollectionJS {
    return {
      title: 'The Links Will Rise Again!',
      name: 'the_links_will_rise_again',
      items: [
        CollectionItemMock.testOneJS()
      ]
    };
  }

  public static testOneTwoJS(): CollectionJS {
    return {
      title: 'The Links Will Be Reloaded!',
      name: 'the_links_will_be_reloaded',
      items: [
        CollectionItemMock.testOneJS(),
        CollectionItemMock.testTwoJS()
      ]
    };
  }

  static getContext(): CollectionContext {
    return CollectionItemMock.getContext();
  }

  static testOneOnly() {
    return Collection.fromJS(CollectionMock.testOneOnlyJS(), CollectionMock.getContext());
  }

  static testOneTwo() {
    return Collection.fromJS(CollectionMock.testOneTwoJS(), CollectionMock.getContext());
  }
}
