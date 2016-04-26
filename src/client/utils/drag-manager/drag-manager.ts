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
