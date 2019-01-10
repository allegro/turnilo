/*
 * Copyright 2017-2018 Allegro.pl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { List, Record } from "immutable";
import { Unary } from "../../utils/functional/functional";
import { Measure } from "../measure/measure";
import { Measures } from "../measure/measures";
import { fromJS, MeasureSeriesDefinition, SeriesDefinition } from "../series/series-definition";

interface SeriesListValue {
  series: List<SeriesDefinition>;
}

const defaultSeriesList: SeriesListValue = { series: List([]) };

export class SeriesList extends Record<SeriesListValue>(defaultSeriesList) {

  /**
   * @deprecated
   */
  static fromMeasureNames(names: string[]): SeriesList {
    return new SeriesList({ series: List(names.map(reference => new MeasureSeriesDefinition({ reference }))) });
  }

  static fromJS(seriesDefs: any[]): SeriesList {
    const series = List(seriesDefs.map(def => fromJS(def)));
    return new SeriesList({ series });
  }

  public addSeries(newSeries: SeriesDefinition): SeriesList {
    const { series } = this;
    return this.insertByIndex(series.count(), newSeries);
  }

  public removeSeries(series: SeriesDefinition): SeriesList {
    return this.updateSeries(list => list.filter(s => s !== series));
  }

  public replaceSeries(original: SeriesDefinition, newSeries: SeriesDefinition): SeriesList {
    return this.updateSeries(series => series.map(s => s.equals(original) ? newSeries : s));
  }

  public replaceByIndex(index: number, replace: SeriesDefinition): SeriesList {
    const { series } = this;
    if (series.count() === index) {
      return this.insertByIndex(index, replace);
    }
    return this.updateSeries(series => {
      const newSplitIndex = series.findIndex(split => split.equals(replace));
      if (newSplitIndex === -1) return series.set(index, replace);
      const oldSplit = series.get(index);
      return series
        .set(index, replace)
        .set(newSplitIndex, oldSplit);
    });
  }

  public insertByIndex(index: number, insert: SeriesDefinition): SeriesList {
    return this.updateSeries(list =>
      list
        .insert(index, insert)
        .filterNot((series, idx) => series.equals(insert) && idx !== index));
  }

  public hasMeasureSeries(reference: string): boolean {
    return this.getMeasureSeries(reference) !== undefined;
  }

  public hasSeriesForMeasure({ name }: Measure): boolean {
    return this.hasMeasureSeries(name);
  }

  public getMeasureSeries(reference: string): SeriesDefinition {
    return this.series.find(series => series.reference === reference && series instanceof MeasureSeriesDefinition);
  }

  public constrainToMeasures(measures: Measures): SeriesList {
    return this.updateSeries(list => list.filter(series => measures.getMeasureByName(series.reference)));
  }

  public count(): number {
    return this.series.count();
  }

  private updateSeries(updater: Unary<List<SeriesDefinition>, List<SeriesDefinition>>) {
    return this.update("series", updater);
  }
}

export const EMPTY_SERIES = new SeriesList({ series: List([]) });
