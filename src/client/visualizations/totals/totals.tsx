require('./totals.css');

import * as React from 'react';
import { $, ply, Expression, Executor, Dataset } from 'plywood';
import { Stage, Essence, Splits, SplitCombine, Filter, Dimension, Measure, Colors, DataSource, VisualizationProps, DatasetLoad, Resolve } from '../../../common/models/index';
import { Loader } from '../../components/loader/loader';
import { QueryError } from '../../components/query-error/query-error';

const PADDING_H = 60;
const TOTAL_WIDTH = 176;

export interface TotalsState {
  datasetLoad?: DatasetLoad;
}

export class Totals extends React.Component<VisualizationProps, TotalsState> {
  static id = 'totals';
  static title = 'Totals';

  static measureModeNeed = 'multi';

  static handleCircumstance(dataSource: DataSource, splits: Splits, colors: Colors, current: boolean): Resolve {
    if (!splits.length()) return Resolve.ready(10);
    return Resolve.automatic(3, { splits: Splits.EMPTY });
  }

  public mounted: boolean;

  constructor() {
    super();
    this.state = {
      datasetLoad: {}
    };
  }

  fetchData(essence: Essence): void {
    var { registerDownloadableDataset } = this.props;
    var { dataSource } = essence;
    var measures = essence.getEffectiveMeasures();

    var $main = $('main');

    var query = ply()
      .apply('main', $main.filter(essence.getEffectiveFilter(Totals.id).toExpression()));

    measures.forEach((measure) => {
      query = query.performAction(measure.toApplyAction());
    });

    this.precalculate(this.props, { loading: true });
    dataSource.executor(query, { timezone: essence.timezone })
      .then(
        (dataset: Dataset) => {
          if (!this.mounted) return;
          this.precalculate(this.props, {
            loading: false,
            dataset,
            error: null
          });
        },
        (error) => {
          if (!this.mounted) return;
          this.precalculate(this.props, {
            loading: false,
            dataset: null,
            error
          });
        }
      );
  }

  componentWillMount() {
    this.precalculate(this.props);
  }

  componentDidMount() {
    this.mounted = true;
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
    this.mounted = false;
  }

  precalculate(props: VisualizationProps, datasetLoad: DatasetLoad = null) {
    const { registerDownloadableDataset, essence } = props;
    const { splits } = essence;

    var existingDatasetLoad = this.state.datasetLoad;
    var newState: TotalsState = {};
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

  render() {
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

    return <div className="totals">
      <div className="total-container" style={totalContainerStyle}>{totals}</div>
      {datasetLoad.error ? <QueryError error={datasetLoad.error}/> : null}
      {datasetLoad.loading ? <Loader/> : null}
    </div>;
  }
}
