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

import { Class, Instance, isInstanceOf, immutableArraysEqual } from 'immutable-class';
import { findByName } from 'plywood';

import { Manifest } from '../manifest/manifest';
import { LinkItem, LinkItemJS, LinkItemContext } from '../link-item/link-item';

export interface LinkViewConfigValue {
  title: string;
  linkItems: LinkItem[];
}

export interface LinkViewConfigJS {
  title: string;
  linkItems: LinkItemJS[];
}

export type LinkViewConfigContext = LinkItemContext;

var check: Class<LinkViewConfigValue, LinkViewConfigJS>;
export class LinkViewConfig implements Instance<LinkViewConfigValue, LinkViewConfigJS> {

  static isLinkViewConfig(candidate: any): candidate is LinkViewConfig {
    return isInstanceOf(candidate, LinkViewConfig);
  }

  static fromJS(parameters: LinkViewConfigJS, context?: LinkViewConfigContext): LinkViewConfig {
    if (!context) throw new Error('LinkViewConfig must have context');
    return new LinkViewConfig({
      title: parameters.title,
      linkItems: parameters.linkItems.map(linkItem => LinkItem.fromJS(linkItem, context))
    });
  }

  public title: string;
  public linkItems: LinkItem[];

  constructor(parameters: LinkViewConfigValue) {
    this.title = parameters.title;
    this.linkItems = parameters.linkItems;
  }

  public valueOf(): LinkViewConfigValue {
    return {
      title: this.title,
      linkItems: this.linkItems
    };
  }

  public toJS(): LinkViewConfigJS {
    return {
      title: this.title,
      linkItems: this.linkItems.map(linkItem => linkItem.toJS())
    };
  }

  public toJSON(): LinkViewConfigJS {
    return this.toJS();
  }

  public toString(): string {
    return `[LinkViewConfig: ${this.title}]`;
  }

  public equals(other: LinkViewConfig): boolean {
    return LinkViewConfig.isLinkViewConfig(other) &&
      this.title === other.title &&
      immutableArraysEqual(this.linkItems, other.linkItems);
  }

  public defaultLinkItem(): LinkItem {
    return this.linkItems[0];
  }

  public findByName(name: string): LinkItem {
    return findByName(this.linkItems, name);
  }

}
check = LinkViewConfig;
