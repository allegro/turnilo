import { Class, Instance, isInstanceOf, arraysEqual } from 'immutable-class';
import { $, Expression } from 'plywood';

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

  static isLinkViewConfig(candidate: any): boolean {
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
      arraysEqual(this.linkItems, other.linkItems);
  }

  public first(): LinkItem {
    return this.linkItems[0];
  }

}
check = LinkViewConfig;
