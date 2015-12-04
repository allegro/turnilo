'use strict';

import { Dimension, SplitCombine } from '../../../common/models/index';

export class DragManager {
  static dragDimension: Dimension = null;
  static dragSplit: SplitCombine = null;

  static init() {
    document.addEventListener("dragend", function() {
      DragManager.dragDimension = null;
      DragManager.dragSplit = null;
    }, false);
  }

  static setDragDimension(dimension: Dimension): void {
    DragManager.dragDimension = dimension;
  }

  static getDragDimension(): Dimension {
    return DragManager.dragDimension;
  }

  static setDragSplit(split: SplitCombine): void {
    DragManager.dragSplit = split;
  }

  static getDragSplit(): SplitCombine {
    return DragManager.dragSplit;
  }
}
