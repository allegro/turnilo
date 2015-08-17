'use strict';

import * as jsdom from 'jsdom';

export function setupDOM() {
  var g: any = <any>global;
  if (!g.document) {
    var document = jsdom.jsdom('<!doctype html><html><body></body></html>');
    g.document = document;
    g.window = (<any>document).parentWindow;
  }
}
