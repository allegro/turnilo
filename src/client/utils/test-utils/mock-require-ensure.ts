import { resolve, dirname } from 'path';
import { getCallerFile } from './get-caller-file';
import * as rewire from 'rewire';

export function mockRequireEnsure(path: string): any {
  // Gets the absolute path based on the caller's path
  path = resolve(dirname(getCallerFile()), path);

  let mod = rewire(path);

  let mockedRequire = mod.__get__('require');
  mockedRequire.ensure = (path: any, callback: any) => callback(mockedRequire);

  return mod;
}
