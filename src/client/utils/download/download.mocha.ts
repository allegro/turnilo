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


