import { SortOn, SortOnJS } from './sort-on';
import { $ } from 'plywood';

export class SortOnMock {
  public static get DEFAULT_A_JS(): SortOnJS {
    return {
      measure: {
        name: 'price',
        title: 'Price',
        expression: $('main').min('$price').toJS()
      }
    };
  }

  public static get DEFAULT_B_JS(): SortOnJS {
    return {
      measure: {
        expression: {
          action: {
            action: 'sum',
            expression: {
              name: 'price',
              op: 'ref'
            }
          },
          expression: {
            name: 'main',
            op: 'ref'
          },
          op: 'chain'
        },
        name: 'price',
        title: 'Price'
      }
    };
  }

  public static get DEFAULT_C_JS(): SortOnJS {
    return {
      dimension: {
        name: 'country',
        title: 'important countries',
        'expression': {
          'op': 'literal',
          'value': { 'setType': 'STRING', 'elements': ['en'] },
          'type': 'SET'
        },
        kind: 'string'
      }
    };
  }

  static defaultA() {
    return SortOn.fromJS(SortOnMock.DEFAULT_A_JS);
  }

  static defaultB() {
    return SortOn.fromJS(SortOnMock.DEFAULT_B_JS);
  }

  static defaultC() {
    return SortOn.fromJS(SortOnMock.DEFAULT_C_JS);
  }
}
