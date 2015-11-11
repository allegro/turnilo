'use strict';

import * as React from 'react';
import { DataSource } from '../data-source/data-source';
import { Splits } from '../splits/splits';

export interface Resolution {
  description: string;
  adjustment: Splits;
}

export class Resolve {
  static NEVER: Resolve;
  static READY: Resolve;

  static automatic(adjustment: Splits) {
    return new Resolve('automatic', adjustment, null, null);
  }

  static manual(message: string, resolutions: Resolution[]) {
    return new Resolve('manual', null, message, resolutions);
  }


  public state: string;
  public adjustment: Splits;
  public message: string;
  public resolutions: Resolution[];

  constructor(state: string, adjustment: Splits, message: string, resolutions: Resolution[]) {
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

Resolve.NEVER = new Resolve('never', null, null, null);
Resolve.READY = new Resolve('ready', null, null, null);

export interface Manifest {
  id: string;
  title: string;
  handleCircumstance: (dataSource: DataSource, splits: Splits) => Resolve;
}
