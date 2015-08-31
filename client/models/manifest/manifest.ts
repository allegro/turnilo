'use strict';

import * as React from 'react/addons';
import { DataSource } from '../data-source/data-source';
import { Splits } from '../splits/splits';

export class Resolve {
  static READY: Resolve;
  static AUTOMATIC: Resolve;
  static MANUAL: Resolve;

  public value: string;

  constructor(value: string) {
    this.value = value;
  }

  public toString(): string {
    return this.value;
  }

  public valueOf(): string {
    return this.value;
  }

  public isReady(): boolean {
    return this.value === "ready";
  }
}

Resolve.READY = new Resolve("ready");
Resolve.AUTOMATIC = new Resolve("automatic");
Resolve.MANUAL = new Resolve("manual");

export interface Manifest {
  id: string;
  title: string;
  handleCircumstance: (dataSource: DataSource, splits: Splits) => Resolve;
}
