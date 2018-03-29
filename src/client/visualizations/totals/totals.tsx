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

import './totals.scss';

import * as React from 'react';
import { $, ply, Expression } from 'plywood';
import { TOTALS_MANIFEST } from '../../../common/manifests/totals/totals';
import { Stage, Essence, Timekeeper, VisualizationProps, DatasetLoad } from '../../../common/models/index';

import { BaseVisualization, BaseVisualizationState } from '../base-visualization/base-visualization';

const PADDING_H = 60;
const TOTAL_WIDTH = 176;

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
      nextEssence.newEffectiveMeasures(essence) ||
      nextEssence.dataCube.refreshRule.isRealtime();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  makeQuery(essence: Essence, timekeeper: Timekeeper): Expression {
    let query: Expression = ply()
      .apply('main', $('main').filter(essence.getEffectiveFilter(timekeeper, Totals.id).toExpression()));

    essence.getEffectiveMeasures().forEach((measure) => {
      query = query.performAction(measure.toApplyExpression());
    });

    return query;
  }

  precalculate(props: VisualizationProps, datasetLoad: DatasetLoad = null) {
    const { registerDownloadableDataset, essence } = props;
    const { splits } = essence;

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
    if (dataset && splits.length()) {
      if (registerDownloadableDataset) registerDownloadableDataset(dataset);
    }

    this.setState(newState);
  }

  renderInternals() {
    const { essence, stage } = this.props;
    const { datasetLoad } = this.state;

    const myDatum = datasetLoad.dataset ? datasetLoad.dataset.data[0] : null;
    const measures = essence.getEffectiveMeasures();
    let single = measures.size === 1;

    const totals = measures.map(measure => {
      let measureValueStr = '-';
      if (myDatum) {
        measureValueStr = measure.formatDatum(myDatum);
      }

      return <div
        className={'total' + (single ? ' single' : '')}
        key={measure.name}
      >
        <div className="measure-name">{measure.title}</div>
        <div className="measure-value">{measureValueStr}</div>
      </div>;
    });

    let totalContainerStyle: React.CSSProperties = null;
    if (!single) {
      const numColumns = Math.min(totals.size, Math.max(1, Math.floor((stage.width - 2 * PADDING_H) / TOTAL_WIDTH)));
      let containerWidth = numColumns * TOTAL_WIDTH;
      totalContainerStyle = {
        left: '50%',
        width: containerWidth,
        marginLeft: -containerWidth / 2
      };
    }

    return <div className="internals">
      <div className="total-container" style={totalContainerStyle}>
        {totals}
      </div>
    </div>;
  }
}
