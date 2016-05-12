require('./totals.css');

import { BaseVisualization, BaseVisualizationState } from '../base-visualization/base-visualization';

import * as React from 'react';
import { $, ply, Expression, Executor, Dataset } from 'plywood';
import { MeasureModeNeeded, Stage, Essence, Splits, SplitCombine, Filter, Dimension, Measure, Colors, DataSource, VisualizationProps, DatasetLoad, Resolve } from '../../../common/models/index';

const PADDING_H = 60;
const TOTAL_WIDTH = 176;

export class Totals extends BaseVisualization<BaseVisualizationState> {
  public static id = 'totals';
  public static title = 'Totals';

  // For some reason, tsc absolutely wants a typing here, otherwise it throws a
  // weird TS2322 error...
  public static measureModeNeed: MeasureModeNeeded = 'multi';

  public static handleCircumstance(dataSource: DataSource, splits: Splits, colors: Colors, current: boolean): Resolve {
    if (!splits.length()) return Resolve.ready(10);
    return Resolve.automatic(3, { splits: Splits.EMPTY });
  }

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
