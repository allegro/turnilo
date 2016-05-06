import { expect } from 'chai';
import { getVisibleSegments, Positioning } from './sizing';

describe('Sizing', () => {
  describe('getVisibleSegments', () => {

    it('works with basic stuff', () => {
      expect(getVisibleSegments([100, 100, 100, 100, 100], 0, 250)).to.deep.equal({
        startIndex: 0,
        shownColumns: 3
      });
    });

    it('works with slight offset', () => {
      expect(getVisibleSegments([100, 100, 100, 100, 100], 90, 200)).to.deep.equal({
        startIndex: 0,
        shownColumns: 3
      });
    });

    it('works with more offset', () => {
      expect(getVisibleSegments([100, 100, 100, 100, 100], 150, 200)).to.deep.equal({
        startIndex: 1,
        shownColumns: 3
      });
    });

  });

});


