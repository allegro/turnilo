import { List } from 'immutable';
import { Class, Instance, isInstanceOf, immutableArraysEqual } from 'immutable-class';
import { $, Expression } from 'plywood';
import { immutableListsEqual } from '../../utils/general/general';

import { LinkItem, LinkItemJS, LinkItemContext } from '../link-item/link-item';

export interface LinkViewConfigValue {
  title: string;
  linkItems: List<LinkItem>;
}

export interface LinkViewConfigJS {
  title: string;
  linkItems: LinkItemJS[];
}

var check: Class<LinkViewConfigValue, LinkViewConfigJS>;
export class LinkViewConfig implements Instance<LinkViewConfigValue, LinkViewConfigJS> {

  static isLinkViewConfig(candidate: any): candidate is LinkViewConfig {
    return isInstanceOf(candidate, LinkViewConfig);
  }

  static fromJS(parameters: LinkViewConfigJS, context?: LinkItemContext): LinkViewConfig {
    return new LinkViewConfig({
      title: parameters.title,
      linkItems: List(parameters.linkItems.map(linkItem => LinkItem.fromJS(linkItem, context)))
    });
  }

  public title: string;
  public linkItems: List<LinkItem>;

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
      linkItems: this.linkItems.toArray().map(linkItem => linkItem.toJS())
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
      immutableListsEqual(this.linkItems, other.linkItems);
  }

  public defaultLinkItem(): LinkItem {
    return this.linkItems.first();
  }

  public findByName(name: string): LinkItem {
    return this.linkItems.find(li => li.name === name);
  }

}
check = LinkViewConfig;
