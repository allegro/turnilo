'use strict';

import { List, OrderedSet } from 'immutable';
import { ImmutableClass, ImmutableInstance, isInstanceOf, arraysEqual } from 'higher-object';
import { Timezone, Duration } from 'chronology';
import { $, Expression } from 'plywood';
import { listsEqual } from '../../utils/general';
import { DataSource } from '../data-source/data-source';
import { Filter, FilterJS } from '../filter/filter';
import { SplitCombine, SplitCombineJS } from '../split-combine/split-combine';
import { Dimension } from '../dimension/dimension';
import { Measure } from '../measure/measure';

interface EssenceValue {
  timezone: Timezone;
  filter: Filter;
  splits: List<SplitCombine>;
  selectedMeasures: OrderedSet<string>;
  pinnedDimensions: OrderedSet<string>;
  visualization: string;
}

interface EssenceJS {
  timezone: string;
  filter: FilterJS;
  splits: SplitCombineJS[];
  selectedMeasures: string[];
  pinnedDimensions: string[];
  visualization: string;
}

var check: ImmutableClass<EssenceValue, EssenceJS>;
export class Essence implements ImmutableInstance<EssenceValue, EssenceJS> {
  public timezone: Timezone;
  public filter: Filter;
  public splits: List<SplitCombine>;
  public selectedMeasures: OrderedSet<string>;
  public pinnedDimensions: OrderedSet<string>;
  public visualization: string;

  static isEssence(candidate: any): boolean {
    return isInstanceOf(candidate, Essence);
  }

  static fromJS(parameters: EssenceJS): Essence {
    var timezone = Timezone.fromJS(parameters.timezone);
    var filter = Filter.fromJS(parameters.filter);
    var splits = List(parameters.splits.map((split: SplitCombineJS) => SplitCombine.fromJS(split)));
    var selectedMeasures = OrderedSet(parameters.selectedMeasures);
    var pinnedDimensions = OrderedSet(parameters.pinnedDimensions);
    var visualization = parameters.visualization;

    return new Essence({
      timezone,
      filter,
      splits,
      selectedMeasures,
      pinnedDimensions,
      visualization
    });
  }

  constructor(parameters: EssenceValue) {
    this.timezone = parameters.timezone;
    this.filter = parameters.filter;
    this.splits = parameters.splits;
    this.selectedMeasures = parameters.selectedMeasures;
    this.pinnedDimensions = parameters.pinnedDimensions;
    this.visualization = parameters.visualization;
  }

  public valueOf(): EssenceValue {
    return {
      timezone: this.timezone,
      filter: this.filter,
      splits: this.splits,
      selectedMeasures: this.selectedMeasures,
      pinnedDimensions: this.pinnedDimensions,
      visualization: this.visualization
    };
  }

  public toJS(): EssenceJS {
    return {
      timezone: this.timezone.toJS(),
      filter: this.filter.toJS(),
      splits: this.splits.toArray().map(split => split.toJS()),
      selectedMeasures: this.selectedMeasures.toArray(),
      pinnedDimensions: this.pinnedDimensions.toArray(),
      visualization: this.visualization
    };
  }

  public toJSON(): EssenceJS {
    return this.toJS();
  }

  public toString(): string {
    return `[Essence]`;
  }

  public equals(other: Essence): boolean {
    return Essence.isEssence(other) &&
      this.timezone.equals(other.timezone) &&
      this.filter.equals(other.filter) &&
      // More
      this.visualization === other.visualization;
  }
}
check = Essence;
