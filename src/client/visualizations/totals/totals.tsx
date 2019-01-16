/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import * as React from "react";
import { TOTALS_MANIFEST } from "../../../common/manifests/totals/totals";
import { MeasureDerivation } from "../../../common/models/measure/measure";
import { DatasetLoad, VisualizationProps } from "../../../common/models/visualization-props/visualization-props";
import { seriesFormatter } from "../../../common/utils/formatter/formatter";
import { BaseVisualization, BaseVisualizationState } from "../base-visualization/base-visualization";
import { Total } from "./total";
import "./totals.scss";

export class Totals extends BaseVisualization<BaseVisualizationState> {
  public static id = TOTALS_MANIFEST.name;

  componentWillMount() {
    this.precalculate(this.props);
  }

  componentDidMount() {
    this._isMounted = true;
    const { essence, timekeeper } = this.props;
    this.fetchData(essence, timekeeper);
  }

  shouldFetchData(nextProps: VisualizationProps): boolean {
    const { essence, timekeeper } = this.props;
    const nextEssence = nextProps.essence;
    const nextTimekeeper = nextProps.timekeeper;
    return nextEssence.differentDataCube(essence) ||
      nextEssence.differentEffectiveFilter(essence, timekeeper, nextTimekeeper, Totals.id) ||
      nextEssence.differentTimeShift(essence) ||
      nextEssence.newEffectiveMeasures(essence) ||
      nextEssence.dataCube.refreshRule.isRealtime();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  precalculate(props: VisualizationProps, datasetLoad: DatasetLoad = null) {
    const { registerDownloadableDataset } = props;

    const existingDatasetLoad = this.state.datasetLoad;
    const newState: BaseVisualizationState = {};
    if (datasetLoad) {
      // Always keep the old dataset while loading
      if (datasetLoad.loading) datasetLoad.dataset = existingDatasetLoad.dataset;

      newState.datasetLoad = datasetLoad;
    } else {
      datasetLoad = existingDatasetLoad;
    }

    const { dataset } = datasetLoad;
    if (dataset) {
      if (registerDownloadableDataset) registerDownloadableDataset(dataset);
    }

    this.setState(newState);
  }

  renderTotals(): JSX.Element[] {
    const { essence } = this.props;
    const { datasetLoad: { dataset } } = this.state;
    const series = essence.series.series;
    const datum = dataset ? dataset.data[0] : null;
    if (!datum) {
      return series.map(series => {
        const measure = series.reference;
        return <Total
          key={measure.name}
          formatter={seriesFormatter(series.format, measure )}
          name={measure.title}
          lowerIsBetter={measure.lowerIsBetter}
          value={null}/>;
      }).toArray();
    }

    return series.map(series => {
      const measure = series.reference;
      const currentValue = datum[measure.name] as number;
      const previousValue = essence.hasComparison() && datum[measure.getDerivedName(MeasureDerivation.PREVIOUS)] as number;

      return <Total
        key={measure.name}
        name={measure.title}
        value={currentValue}
        previous={previousValue}
        lowerIsBetter={measure.lowerIsBetter}
        formatter={seriesFormatter(series.format, measure)}
      />;
    }).toArray();

  }

  renderInternals() {
    return <div className="internals">
      <div className="total-container">
        {this.renderTotals()}
      </div>
    </div>;
  }
}
