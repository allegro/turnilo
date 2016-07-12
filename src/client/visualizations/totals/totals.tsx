/*
 * Copyright 2015-2016 Imply Data, Inc.
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

require('./totals.css');

import * as React from 'react';
import { $, ply, Expression, Executor, Dataset } from 'plywood';
import { TOTALS_MANIFEST } from '../../../common/manifests/totals/totals';
import { Stage, Essence, VisualizationProps, DatasetLoad } from '../../../common/models/index';

import { BaseVisualization, BaseVisualizationState } from '../base-visualization/base-visualization';

const PADDING_H = 60;
const TOTAL_WIDTH = 176;

export class Totals extends BaseVisualization<BaseVisualizationState> {
  public static id = TOTALS_MANIFEST.name;

  constructor() {
    super();
  }

  componentWillMount() {
    this.precalculate(this.props);
  }

  componentDidMount() {
    this._isMounted = true;
    var { essence } = this.props;
    this.fetchData(essence);
  }

  componentWillReceiveProps(nextProps: VisualizationProps) {
    this.precalculate(nextProps);
    var { essence } = this.props;
    var nextEssence = nextProps.essence;
    if (
      nextEssence.differentDataSource(essence) ||
      nextEssence.differentEffectiveFilter(essence, Totals.id) ||
      nextEssence.newEffectiveMeasures(essence)
    ) {
      this.fetchData(nextEssence);
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  makeQuery(essence: Essence): Expression {
    var query = ply()
      .apply('main', $('main').filter(essence.getEffectiveFilter(Totals.id).toExpression()));

    essence.getEffectiveMeasures().forEach((measure) => {
      query = query.performAction(measure.toApplyAction());
    });

    return query;
  }

  precalculate(props: VisualizationProps, datasetLoad: DatasetLoad = null) {
    const { registerDownloadableDataset, essence } = props;
    const { splits } = essence;

    var existingDatasetLoad = this.state.datasetLoad;
    var newState: BaseVisualizationState = {};
    if (datasetLoad) {
      // Always keep the old dataset while loading
      if (datasetLoad.loading) datasetLoad.dataset = existingDatasetLoad.dataset;

      newState.datasetLoad = datasetLoad;
    } else {
      datasetLoad = existingDatasetLoad;
    }

    var { dataset } = datasetLoad;
    if (dataset && splits.length()) {
      if (registerDownloadableDataset) registerDownloadableDataset(dataset);
    }

    this.setState(newState);
  }

  renderInternals() {
    var { essence, stage } = this.props;
    var { datasetLoad } = this.state;

    var myDatum = datasetLoad.dataset ? datasetLoad.dataset.data[0] : null;
    var measures = essence.getEffectiveMeasures();
    var single = measures.size === 1;

    var totals = measures.map(measure => {
      var measureValueStr = '-';
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

    var totalContainerStyle: React.CSSProperties = null;
    if (!single) {
      var numColumns = Math.min(totals.size, Math.max(1, Math.floor((stage.width - 2 * PADDING_H) / TOTAL_WIDTH)));
      var containerWidth = numColumns * TOTAL_WIDTH;
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
