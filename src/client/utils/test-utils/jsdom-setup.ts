import * as jsdom from 'jsdom';
var kickstart = () => {
  let g: any = <any>global;
  let document = jsdom.jsdom('<!doctype html><html><body></body></html>');
  g.document = document;
  g.window = (<any>document).defaultView;
  g.navigator = {
    userAgent: 'testing'
  };
};

var cleanup = () => {
  let g: any = <any>global;
  delete g.document;
  delete g.window;
  delete g.navigator;
};


// Initial kickstart is neede because of required modules
// (FileSaver, I'm looking at you)
kickstart();

beforeEach(kickstart);
afterEach(cleanup);

