import {resolve, dirname} from 'path';
import * as rewire from 'rewire';

function getCallerFile() {
  var stack = getStack();

  stack.shift(); // getCaller --> getStack
  stack.shift(); // caller of getCaller --> getCaller

  return stack[0].getFileName();
}

function getStack(): any[] {
  let ErrorConstructor = <any>Error;

  var origPrepareStackTrace = ErrorConstructor.prepareStackTrace;

  ErrorConstructor.prepareStackTrace = (_: any, stack: any) => stack;

  var err = new Error() as any;
  var stack = err['stack'] as any[];
  ErrorConstructor.prepareStackTrace = origPrepareStackTrace;
  stack.shift(); // getStack --> Error

  return stack;
}

export function mockRequireEnsure(path: string): any {
  // Gets the absolute path based on the caller's path
  path = resolve(dirname(getCallerFile()), path);

  let mod = rewire(path);

  let mockedRequire = mod.__get__('require');
  mockedRequire.ensure = (path: any, callback: any) => callback(mockedRequire);

  return mod;
}
