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


