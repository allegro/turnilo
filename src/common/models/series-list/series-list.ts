/*
 * Copyright 2017-2019 Allegro.pl
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
import { isTruthy } from "../../utils/general/general";
import { ArithmeticExpression } from "../expression/concreteArithmeticOperation";
import { Measure } from "../measure/measure";
import { findMeasureByName, hasMeasureWithName, Measures } from "../measure/measures";
import { ExpressionSeries } from "../series/expression-series";
import { MeasureSeries } from "../series/measure-series";
import { fromJS, fromMeasure, Series } from "../series/series";

interface SeriesListValue {
  series: List<Series>;
}

const defaultSeriesList: SeriesListValue = { series: List([]) };

export class SeriesList extends Record<SeriesListValue>(defaultSeriesList) {

  static fromMeasures(measures: Measure[]): SeriesList {
    const series = List(measures.map(fromMeasure));
    return new SeriesList({ series });
  }

  static fromJS(seriesDefs: any[], measures: Measures): SeriesList {
    const series = List(seriesDefs.map(def => {
      const measure = findMeasureByName(measures, def.reference);
      return fromJS(def, measure);
    }));
    return new SeriesList({ series });
  }

  static fromSeries(series: Series[]): SeriesList {
    return new SeriesList({ series: List(series) });
  }

  static validSeries(series: Series, measures: Measures): boolean {
    if (series instanceof ExpressionSeries && series.expression instanceof ArithmeticExpression) {
      return hasMeasureWithName(measures, series.reference) && hasMeasureWithName(measures, series.expression.reference);
    }
    return hasMeasureWithName(measures, series.reference);
  }

  public addSeries(newSeries: Series): SeriesList {
    const { series } = this;
    return this.insertByIndex(series.count(), newSeries);
  }

  public removeSeries(series: Series): SeriesList {
    return this.updateSeries(list => list.filter(s => s.key() !== series.key()));
  }

  public replaceSeries(original: Series, newSeries: Series): SeriesList {
    return this.updateSeries(series => {
      const idx = series.findIndex(s => s.equals(original));
      if (idx === -1) throw new Error(`Couldn't replace series because couldn't find original: ${original}`);
      return series.set(idx, newSeries);
    });
  }

  public replaceByIndex(index: number, replace: Series): SeriesList {
    const { series } = this;
    if (series.count() === index) {
      return this.insertByIndex(index, replace);
    }
    return this.updateSeries(series => {
      const newSeriesIndex = series.findIndex(split => split.equals(replace));
      if (newSeriesIndex === -1) return series.set(index, replace);
      const oldSplit = series.get(index);
      return series
        .set(index, replace)
        .set(newSeriesIndex, oldSplit);
    });
  }

  public insertByIndex(index: number, insert: Series): SeriesList {
    return this.updateSeries(list =>
      list
        .insert(index, insert)
        .filterNot((series, idx) => series.equals(insert) && idx !== index));
  }

  public hasMeasureSeries(reference: string): boolean {
    const series = this.getSeries(reference);
    return series && series instanceof MeasureSeries;
  }

  public hasMeasure({ name }: Measure): boolean {
    return this.hasMeasureSeries(name);
  }

  public getSeries(reference: string): Series {
    return this.series.find(series => series.reference === reference);
  }

  public constrainToMeasures(measures: Measures): SeriesList {
    return this.updateSeries(list => list.filter(series => SeriesList.validSeries(series, measures)));
  }

  public count(): number {
    return this.series.count();
  }

  public isEmpty(): boolean {
    return this.series.isEmpty();
  }

  private updateSeries(updater: Unary<List<Series>, List<Series>>) {
    return this.update("series", updater);
  }

  public hasSeries(series: Series): boolean {
    return this.series.find(s => s.equals(series)) !== undefined;
  }

  public hasSeriesWithKey(key: string): boolean {
    return isTruthy(this.getSeriesWithKey(key));
  }

  public getSeriesWithKey(key: string): Series {
    return this.series.find(series => series.key() === key);
  }

  public takeFirst() {
    return this.updateSeries(series => series.take(1));
  }

  public takeNFirst(number: number): SeriesList {
    return this.updateSeries(series => series.take(number));
  }

  public getExpressionSeriesFor(reference: string): List<ExpressionSeries> {
    return this.series.filter(series =>
      series.reference === reference && series instanceof ExpressionSeries) as List<ExpressionSeries>;
  }

  public getSeriesKeys(): List<string> {
    return this.series.map(series => series.key());
  }
}

export const EMPTY_SERIES = new SeriesList({ series: List([]) });
