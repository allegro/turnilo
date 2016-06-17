export class SplitCombineMock {
  public static get TIME_JS() {
    return {
        expression: { op: 'ref', name: 'time' },
        sortAction: {
          action: 'sort',
          direction: 'ascending',
          expression: {
            op: 'ref',
            name: 'time'
          }
        },
        limitAction: {
          action: 'limit',
          limit: 2
        }
      };
  }
}
