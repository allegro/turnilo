'use strict';

import * as React from 'react/addons';
import { DataSource } from '../data-source/data-source';
import { Splits } from '../splits/splits';

export interface AdjustmentFn {
  (): Splits;
}

export interface Resolution {
  description: string;
  adjustment: AdjustmentFn;
}

export class Resolve {
  static READY: Resolve;

  static automatic(adjustment: AdjustmentFn) {
    return new Resolve('automatic', adjustment, null, null);
  }

  static manual(message: string, resolutions: Resolution[]) {
    return new Resolve('manual', null, message, resolutions);
  }


  public state: string;
  public adjustment: AdjustmentFn;
  public message: string;
  public resolutions: Resolution[];

  constructor(state: string, adjustment: AdjustmentFn, message: string, resolutions: Resolution[]) {
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

Resolve.READY = new Resolve('ready', null, null, null);

export interface Manifest {
  id: string;
  title: string;
  handleCircumstance: (dataSource: DataSource, splits: Splits) => Resolve;
}
