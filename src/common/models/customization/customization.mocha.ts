import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class/build/tester';
import { Customization, CustomizationJS } from './customization';

var { WallTime } = require('chronoshift');
if (!WallTime.rules) {
  var tzData = require("chronoshift/lib/walltime/walltime-data.js");
  WallTime.init(tzData.rules, tzData.zones);
}

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
      },
      {
        headerBackground: "green",
        externalViews: [],
        timezones: ["Pacific/Niue", "America/Los_Angeles"]
      }
    ]);
  });

  it("throws for invalid timezone", () => {
    expect(() => {
      Customization.fromJS({
        headerBackground: "green",
        externalViews: [],
        timezones: ["Pacific/Niue", "Not a timezone"]
      });
    }).to.throw("Unable to find time zone named Not a timezone");
  });

});
