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

import { Dimension, SplitCombine } from '../../../common/models/index';

export class DragManager {
  static dragOrigin: string = null;
  static dragDimension: Dimension = null;
  static dragSplit: SplitCombine = null;

  static init() {
    document.addEventListener("dragend", function() {
      DragManager.dragOrigin = null;
      DragManager.dragDimension = null;
      DragManager.dragSplit = null;
    }, false);
  }

  static getDragOrigin(): string {
    return DragManager.dragOrigin;
  }

  static setDragDimension(dimension: Dimension, origin: string): void {
    DragManager.dragDimension = dimension;
    DragManager.dragOrigin = origin;
  }

  static getDragDimension(): Dimension {
    return DragManager.dragDimension;
  }

  static setDragSplit(split: SplitCombine, origin: string): void {
    DragManager.dragSplit = split;
    DragManager.dragOrigin = origin;
  }

  static getDragSplit(): SplitCombine {
    return DragManager.dragSplit;
  }
}
