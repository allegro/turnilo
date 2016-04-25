import { Class, Instance, isInstanceOf } from 'immutable-class';
import { hasOwnProperty } from '../../utils/general/general';

export interface DragPositionValue {
  insert?: number;
  replace?: number;
}

export interface DragPositionJS {
  insert?: number;
  replace?: number;
}

var check: Class<DragPositionValue, DragPositionJS>;
export class DragPosition implements Instance<DragPositionValue, DragPositionJS> {

  static isDragPosition(candidate: any): candidate is DragPosition {
    return isInstanceOf(candidate, DragPosition);
  }

  static calculateFromOffset(offset: number, numItems: number, itemWidth: number, itemGap: number): DragPosition {
    if (!numItems) {
      return new DragPosition({
        replace: 0
      });
    }

    if (offset < 0) {
      return new DragPosition({
        insert: 0
      });
    }

    var sectionWidth = itemWidth + itemGap;
    var sectionNumber = Math.floor(offset / sectionWidth);
    if (sectionNumber > numItems) {
      return new DragPosition({
        replace: numItems
      });
    }

    var offsetWithinSection = offset - sectionWidth * sectionNumber;
    if (offsetWithinSection < itemWidth) {
      return new DragPosition({
        replace: sectionNumber
      });
    } else {
      return new DragPosition({
        insert: sectionNumber + 1
      });
    }
  }

  static fromJS(parameters: DragPositionJS): DragPosition {
    return new DragPosition(parameters);
  }


  public insert: number;
  public replace: number;

  constructor(parameters: DragPositionValue) {
    this.insert = hasOwnProperty(parameters, 'insert') ? parameters.insert : null;
    this.replace = hasOwnProperty(parameters, 'replace') ? parameters.replace : null;
    if (this.insert == null && this.replace == null) throw new Error('invalid drag position');
  }

  public valueOf(): DragPositionValue {
    return {
      insert: this.insert,
      replace: this.replace
    };
  }

  public toJS(): DragPositionJS {
    var js: DragPositionJS = {};
    if (this.insert != null) js.insert = this.insert;
    if (this.replace != null) js.replace = this.replace;
    return js;
  }

  public toJSON(): DragPositionJS {
    return this.toJS();
  }

  public toString(): string {
    if (this.insert != null) {
      return `[insert ${this.insert}]`;
    } else {
      return `[replace ${this.replace}]`;
    }
  }

  public equals(other: DragPosition): boolean {
    return DragPosition.isDragPosition(other) &&
      this.insert === other.insert &&
      this.replace === other.replace;
  }

}
check = DragPosition;
