import { $ } from 'plywood';

import { MANIFESTS } from "../../manifests/index";
import { DataSourceMock } from "../data-source/data-source.mock";
import { LinkItem, LinkItemJS, LinkItemContext } from './link-item';

export class LinkItemMock {
  public static testOneJS(): LinkItemJS {
    return {
      name: 'test1',
      title: 'Test One',
      description: 'I like testing',
      group: 'Tests',
      dataSource: 'wiki',
      essence: {
        visualization: 'totals',
        timezone: 'Etc/UTC',
        filter: {
          op: "literal",
          value: true
        },
        pinnedDimensions: ['articleName'],
        singleMeasure: "count",
        selectedMeasures: ['count'],
        splits: []
      }
    };
  }

  public static testTwoJS(): LinkItemJS {
    return {
      name: 'test2',
      title: 'Test Two',
      description: 'I like testing',
      group: 'Tests',
      dataSource: 'wiki',
      essence: {
        visualization: 'totals',
        timezone: 'Etc/UTC',
        filter: $('time').in(new Date('2015-01-01Z'), new Date('2016-01-01Z')).toJS(),
        pinnedDimensions: [],
        singleMeasure: "count",
        selectedMeasures: ['count'],
        splits: []
      }
    };
  }

  static getContext(): LinkItemContext {
    return {
      dataSources: [DataSourceMock.wiki()],
      visualizations: MANIFESTS
    };
  }

  static testOne() {
    return LinkItem.fromJS(LinkItemMock.testOneJS(), LinkItemMock.getContext());
  }

  static testTwo() {
    return LinkItem.fromJS(LinkItemMock.testTwoJS(), LinkItemMock.getContext());
  }
}
