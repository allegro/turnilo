export interface BarCoordinatesValue {
  x: number;
  y: number;
  height: number;
  width: number;

  barOffset: number;
  barWidth: number;
  stepWidth: number;
  children: BarCoordinates[];
}

export class BarCoordinates {
  public x: number;
  public y: number;
  public height: number;
  public width: number;

  public barOffset: number;
  public barWidth: number;
  public stepWidth: number;
  public children: BarCoordinates[];

  private hitboxMin: number;
  private hitboxMax: number;

  constructor(parameters: BarCoordinatesValue) {
    this.x = parameters.x;
    this.y = parameters.y;
    this.height = parameters.height;
    this.width = parameters.width;

    this.barOffset = parameters.barOffset;
    this.barWidth = parameters.barWidth;
    this.stepWidth = parameters.stepWidth;
    this.children = parameters.children;

    this.hitboxMin = this.x - this.barOffset;
    this.hitboxMax = this.x + this.barWidth + this.barOffset * 2;
  }

  isXWithin(x: number): boolean {
    return x >= this.hitboxMin && x <= this.hitboxMax;
  }

  hasChildren(): boolean {
    return this.children.length > 0;
  }

  get middleX(): number {
    return this.x + this.barWidth * .5 + this.barOffset;
  }
}
