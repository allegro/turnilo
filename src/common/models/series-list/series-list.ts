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
import { Series } from "../series/series";

interface SeriesListValue {
  series: List<Series>;
}

const defaultSeriesList: SeriesListValue = { series: List([]) };

export class SeriesList extends Record<SeriesListValue>(defaultSeriesList) {

  static fromMeasures(measures: Measure[]): SeriesList {
    return new SeriesList({ series: List(measures.map(reference => new Series({ reference }))) });
  }

  static fromJS(seriesDefs: any[]): SeriesList {
    const series = List(seriesDefs.map(def => Series.fromJS(def)));
    return new SeriesList({ series });
  }

  public addSeries(newSeries: Series): SeriesList {
    const { series } = this;
    return this.insertByIndex(series.count(), newSeries);
  }

  public removeSeries(series: Series): SeriesList {
    return this.updateSeries(list => list.filter(s => s !== series));
  }

  public replaceSeries(original: Series, newSeries: Series): SeriesList {
    return this.updateSeries(series => series.map(s => s.equals(original) ? newSeries : s));
  }

  public replaceByIndex(index: number, replace: Series): SeriesList {
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

  public insertByIndex(index: number, insert: Series): SeriesList {
    return this.updateSeries(list =>
      list
        .insert(index, insert)
        .filterNot((series, idx) => series.equals(insert) && idx !== index));
  }

  public hasMeasure(measure: Measure): boolean {
    return this.getSeries(measure) !== undefined;
  }

  public getSeries(reference: Measure): Series {
    return this.series.find(series => series.reference.equals(reference));
  }

  public constrainToMeasures(measures: Measures): SeriesList {
    return this.updateSeries(list => list.filter(series => measures.has(series.reference)));
  }

  public count(): number {
    return this.series.count();
  }

  private updateSeries(updater: Unary<List<Series>, List<Series>>) {
    return this.update("series", updater);
  }
}

export const EMPTY_SERIES = new SeriesList({ series: List([]) });
