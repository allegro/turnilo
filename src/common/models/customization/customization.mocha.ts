import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class/build/tester';
import { Customization, CustomizationJS } from './customization';

describe('Customization', () => {
  it('is an immutable class', () => {
    testImmutableClass<CustomizationJS>(Customization, [
      {
        title: "Hello World",
        headerBackground: "brown",
        customLogoSvg: "ansvgstring"
      },
      {
        headerBackground: "green",
        externalViews: []
      },
      {
        externalViews: [
          {
            title: "corporate dashboard",
            linkGenerator: "{ return 'https://dashboard.corporate.com/'+filter.toString() }",
            sameWindow: true
          }, {
            title: "google docs",
            linkGenerator: "{ return 'http://182.343.32.2273:8080/'+dataSource.name }"
          }, {
            title: "google docs",
            linkGenerator: "{ return 'http://182.343.32.2273:8080/'+timezone.timezone }"
          }
        ]
      }
    ]);
  });
});
