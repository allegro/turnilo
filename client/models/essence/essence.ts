'use strict';

import { List, OrderedSet } from 'immutable';
import { ImmutableClass, ImmutableInstance, isInstanceOf, arraysEqual } from 'higher-object';
import { Timezone, Duration } from 'chronology';
import { $, Expression } from 'plywood';
import { DataSource } from '../data-source/data-source';
import { Filter } from '../filter/filter';
import { SplitCombine } from '../split-combine/split-combine';
import { Dimension } from '../dimension/dimension';
import { Measure } from '../measure/measure';

interface EssenceValue {
  timezone?: Timezone;
  filter?: Filter;
  splits?: List<SplitCombine>;
  selectedMeasures?: OrderedSet<string>;
  pinnedDimensions?: OrderedSet<string>;
  visualization?: string;
}

export class Essence {



  constructor() {

  }
}

