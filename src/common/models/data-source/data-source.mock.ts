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

import { $, Executor, Dataset, basicExecutorFactory } from 'plywood';
import { DataSource, DataSourceJS } from './data-source';

var executor = basicExecutorFactory({
  datasets: {
    wiki: Dataset.fromJS([]),
    twitter: Dataset.fromJS([])
  }
});

export class DataSourceMock {
  public static get WIKI_JS(): DataSourceJS {
    return {
      name: 'wiki',
      title: 'Wiki',
      description: 'Wiki description',
      engine: 'druid',
      source: 'wiki',
      subsetFilter: null,
      introspection: 'none',
      attributes: [
        { name: 'time', type: 'TIME' },
        { name: 'articleName', type: 'STRING' },
        { name: 'count', type: 'NUMBER', unsplitable: true, makerAction: { action: 'count' } }
      ],
      dimensions: [
        {
          expression: {
            name: 'time',
            op: 'ref'
          },
          kind: 'time',
          name: 'time',
          title: 'Time'
        },
        {
          expression: {
            name: 'articleName',
            op: 'ref'
          },
          kind: 'string',
          name: 'articleName',
          title: 'Article Name'
        }
      ],
      measures: [
        {
          name: 'count',
          title: 'Count',
          expression: $('main').sum('$count').toJS()
        },
        {
          name: 'added',
          title: 'Added',
          expression: $('main').sum('$added').toJS()
        }
      ],
      timeAttribute: 'time',
      defaultTimezone: 'Etc/UTC',
      defaultFilter: { op: 'literal', value: true },
      defaultDuration: 'P3D',
      defaultSortMeasure: 'count',
      defaultPinnedDimensions: ['articleName'],
      defaultSelectedMeasures: ['count'],
      refreshRule: {
        time: new Date('2016-04-30T12:39:51.350Z'),
        rule: "fixed"
      }
    };
  }

  public static get TWITTER_JS(): DataSourceJS {
    return {
      name: 'twitter',
      title: 'Twitter',
      description: 'Twitter description should go here',
      engine: 'druid',
      source: 'twitter',
      subsetFilter: null,
      introspection: 'none',
      dimensions: [
        {
          expression: {
            name: 'time',
            op: 'ref'
          },
          kind: 'time',
          name: 'time',
          title: 'Time'
        },
        {
          expression: {
            name: 'twitterHandle',
            op: 'ref'
          },
          kind: 'string',
          name: 'twitterHandle',
          title: 'Twitter Handle'
        }
      ],
      measures: [
        {
          name: 'count',
          title: 'count',
          expression: {
            name: 'count',
            op: 'ref'
          }

        }
      ],
      timeAttribute: 'time',
      defaultTimezone: 'Etc/UTC',
      defaultFilter: { op: 'literal', value: true },
      defaultDuration: 'P3D',
      defaultSortMeasure: 'count',
      defaultPinnedDimensions: ['tweet'],
      refreshRule: {
        refresh: "PT1M",
        rule: "fixed"
      }
    };
  }

  static wiki() {
    return DataSource.fromJS(DataSourceMock.WIKI_JS, { executor });
  }

  static twitter() {
    return DataSource.fromJS(DataSourceMock.TWITTER_JS, { executor });
  }
}
