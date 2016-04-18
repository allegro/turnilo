import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class/build/tester';

import { $, Expression } from 'plywood';
import { ExternalView } from './external-view';

describe('ExternalView', () => {
  it('is an immutable class', () => {
    testImmutableClass(ExternalView, [
      {
        title: "yahoo",
        linkGenerator : "'http://www.yahoo.com/filters/' + visualization.id"
      },
      {
        title: "google",
        linkGenerator : "'http://www.google.com/datasource/' + datasource.name",
        sameWindow: true
      }
    ]);
  });

});
