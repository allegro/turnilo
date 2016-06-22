import { Class, Instance, isInstanceOf, immutableArraysEqual } from 'immutable-class';
import { helper } from 'plywood';

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

var check: Class<LinkViewConfigValue, LinkViewConfigJS>;
export class LinkViewConfig implements Instance<LinkViewConfigValue, LinkViewConfigJS> {

  static isLinkViewConfig(candidate: any): candidate is LinkViewConfig {
    return isInstanceOf(candidate, LinkViewConfig);
  }

  static fromJS(parameters: LinkViewConfigJS, context?: LinkItemContext): LinkViewConfig {
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
    return helper.findByName(this.linkItems, name);
  }

  public attachVisualizations(visualizations: Manifest[]): LinkViewConfig {
    var value = this.valueOf();
    value.linkItems = value.linkItems.map(linkItem => linkItem.attachVisualizations(visualizations));
    return new LinkViewConfig(value);
  }

}
check = LinkViewConfig;
