import * as React from 'react';
import { DataSource, Splits, Colors } from '../index';

export interface Adjustment {
  splits: Splits;
  colors?: Colors;
}

export interface Resolution {
  description: string;
  adjustment: Adjustment;
}

export class Resolve {
  static NEVER: Resolve = new Resolve(-1, 'never', null, null, null);
  // static READY: Resolve;

  static compare(r1: Resolve, r2: Resolve): number {
    return r2.score - r1.score;
  }

  static automatic(score: number, adjustment: Adjustment) {
    return new Resolve(score, 'automatic', adjustment, null, null);
  }

  static manual(score: number, message: string, resolutions: Resolution[]) {
    return new Resolve(score, 'manual', null, message, resolutions);
  }

  static ready(score: number) {
    return new Resolve(score, 'ready', null, null, null);
  }


  public score: number;
  public state: string;
  public adjustment: Adjustment;
  public message: string;
  public resolutions: Resolution[];

  constructor(score: number, state: string, adjustment: Adjustment, message: string, resolutions: Resolution[]) {
    this.score = Math.max(1, Math.min(10, score));
    this.state = state;
    this.adjustment = adjustment;
    this.message = message;
    this.resolutions = resolutions;
  }

  public toString(): string {
    return this.state;
  }

  public valueOf(): string {
    return this.state;
  }

  public isReady(): boolean {
    return this.state === 'ready';
  }

  public isAutomatic(): boolean {
    return this.state === 'automatic';
  }

  public isManual(): boolean {
    return this.state === 'manual';
  }
}

export type HandleCircumstance = (dataSource: DataSource, splits: Splits, colors: Colors, selected: boolean) => Resolve;
export type MeasureModeNeeded = 'any' | 'single' | 'multi';


export class Manifest {
  public name: string;
  public title: string;
  public handleCircumstance: HandleCircumstance;
  public measureModeNeed: MeasureModeNeeded;

  constructor(name: string, title: string, handleCircumstance: HandleCircumstance, measureModeNeed: MeasureModeNeeded = 'any') {
    this.name = name;
    this.title = title;
    this.handleCircumstance = handleCircumstance;
    this.measureModeNeed = measureModeNeed;
  }
}
