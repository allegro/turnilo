/*
 * Copyright 2015-2016 Imply Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { expect } from 'chai';
import '../../utils/test-utils/index';
import { Dataset } from 'plywood';
import { datasetToFileString, getMIMEType } from './download';

describe.skip('Download', () => {
  describe('datasetToFileString', () => {

    it('defaults to JSON if no type specified', () => {
      var dsJS = [
        { x: 1, y: "hello", z: 2 },
        { x: 2, y: "world", z: 3 }
      ];
      var ds = Dataset.fromJS(dsJS);
      expect(() => { JSON.parse(datasetToFileString(ds)); }).to.not.throw();
      expect(JSON.parse(datasetToFileString(ds))).to.deep.equal(dsJS);
    });

    it('encloses set/string in brackets appropriately', () => {
      var ds = Dataset.fromJS([
        { y: ["dear", "john"] },
        { y: ["from", "peter"] }
      ]);
      expect(datasetToFileString(ds, 'csv').indexOf("\"[dear,john\"]"), 'csv').to.not.equal(-1);
      expect(datasetToFileString(ds, 'tsv').indexOf("[dear,john]"), 'tsv').to.not.equal(-1);
    });
  });

  describe('getMIMEType', () => {
    it('works as expected', () => {
      expect(getMIMEType('csv'), 'csv').to.equal("text/csv");
      expect(getMIMEType('tsv'), 'tsv').to.equal("text/tsv");
      expect(getMIMEType(''), 'csv').to.equal('application/json');
      expect(getMIMEType('json'), 'csv').to.equal('application/json');
      expect(getMIMEType('invalid'), 'csv').to.equal('application/json');
    });
  });
});


