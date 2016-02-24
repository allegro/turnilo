import * as jsdom from 'jsdom';

var g: any = <any>global;
if (!g.document) {
  var document = jsdom.jsdom('<!doctype html><html><body></body></html>');
  g.document = document;
  g.window = (<any>document).defaultView;
  g.navigator = {
    userAgent: 'testing'
  };
}
