import { List } from 'immutable';
import { Class, Instance, isInstanceOf } from 'immutable-class';
import { $, Expression } from 'plywood';
import { verifyUrlSafeName, makeTitle } from '../../utils/general/general';
import { DataSource, DataSourceJS } from '../data-source/data-source';
import { Essence, EssenceJS } from '../essence/essence';
import { Manifest } from '../manifest/manifest';

export interface LinkItemValue {
  name: string;
  title: string;
  description: string;
  group: string;
  dataSource: DataSource;
  essence: Essence;
}

export interface LinkItemJS {
  name: string;
  title: string;
  description: string;
  group: string;
  dataSource: string;
  essence: EssenceJS;
}

export interface LinkItemContext {
  dataSources: List<DataSource>;
  visualizations: List<Manifest>;
}

var check: Class<LinkItemValue, LinkItemJS>;
export class LinkItem implements Instance<LinkItemValue, LinkItemJS> {

  static isLinkItem(candidate: any): candidate is LinkItem {
    return isInstanceOf(candidate, LinkItem);
  }

  static fromJS(parameters: LinkItemJS, context?: LinkItemContext): LinkItem {
    if (!context) throw new Error('must have context');
    const { dataSources, visualizations } = context;

    var dataSourceName = parameters.dataSource;
    var dataSource = dataSources.find(d => d.name === dataSourceName);
    if (!dataSource) throw new Error(`can not find dataSource '${dataSourceName}'`);

    var essence = Essence.fromJS(parameters.essence, { dataSource, visualizations });

    return new LinkItem({
      name: parameters.name,
      title: parameters.title,
      description: parameters.description,
      group: parameters.group,
      dataSource,
      essence
    });
  }

  public name: string;
  public title: string;
  public description: string;
  public group: string;
  public dataSource: DataSource;
  public essence: Essence;

  constructor(parameters: LinkItemValue) {
    var name = parameters.name;
    verifyUrlSafeName(name);
    this.name = name;
    this.title = parameters.title || makeTitle(name);
    this.description = parameters.description;
    this.group = parameters.group;
    this.dataSource = parameters.dataSource;
    this.essence = parameters.essence;
  }

  public valueOf(): LinkItemValue {
    return {
      name: this.name,
      title: this.title,
      description: this.description,
      group: this.group,
      dataSource: this.dataSource,
      essence: this.essence
    };
  }

  public toJS(): LinkItemJS {
    return {
      name: this.name,
      title: this.title,
      description: this.description,
      group: this.group,
      dataSource: this.dataSource.name,
      essence: this.essence.toJS()
    };
  }

  public toJSON(): LinkItemJS {
    return this.toJS();
  }

  public toString(): string {
    return `[LinkItem: ${this.name}]`;
  }

  public equals(other: LinkItem): boolean {
    return LinkItem.isLinkItem(other) &&
      this.name === other.name &&
      this.title === other.title &&
      this.description === other.description &&
      this.group === other.group &&
      this.dataSource.equals(other.dataSource) &&
      this.essence.equals(other.essence);
  }

}
check = LinkItem;
