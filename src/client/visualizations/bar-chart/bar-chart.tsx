require('./bar-chart.css');

import { List } from 'immutable';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $, ply, r, Expression, Executor, Dataset, Datum } from 'plywood';
// import { ... } from '../../config/constants';
import { Stage, Essence, DataSource, Filter, Splits, SplitCombine, Dimension, Measure, Colors, VisualizationProps, Resolve } from '../../../common/models/index';
import { SPLIT, SEGMENT } from '../../config/constants';
import { Loader } from '../../components/loader/loader';
import { QueryError } from '../../components/query-error/query-error';

export interface BarChartState {
  loading?: boolean;
  dataset?: Dataset;
  error?: any;
}

export class BarChart extends React.Component<VisualizationProps, BarChartState> {
  static id = 'bar-chart';
  static title = 'Bar Chart';

  static handleCircumstance(dataSource: DataSource, splits: Splits, colors: Colors, current: boolean): Resolve {
    // Must have at least one dimension
    if (splits.length() === 0) {
      var someDimensions = dataSource.dimensions.toArray().filter(d => d.kind === 'string').slice(0, 2);
      return Resolve.manual(4, 'This visualization requires at least one split',
        someDimensions.map((someDimension) => {
          return {
            description: `Add a split on ${someDimension.title}`,
            adjustment: {
              splits: Splits.fromSplitCombine(SplitCombine.fromExpression(someDimension.expression))
            }
          };
        })
      );
    }

    //return Resolve.ready(8);
    return Resolve.manual(0, 'The Bar Chart visualization is not ready, please select another visualization.', []);
  }

  public mounted: boolean;

  constructor() {
    super();
    this.state = {
      loading: false,
      dataset: null,
      error: null
    };
  }

  fetchData(essence: Essence): void {
    var { splits, dataSource } = essence;
    var measures = essence.getMeasures();

    var $main = $('main');

    var query = ply()
      .apply('main', $main.filter(essence.getEffectiveFilter(BarChart.id).toExpression()));

    measures.forEach((measure) => {
      query = query.performAction(measure.toApplyAction());
    });

    function makeQuery(i: number): Expression {
      var split = splits.get(i);
      var { sortAction, limitAction } = split;
      if (!sortAction) throw new Error('something went wrong in bar chart query generation');

      var subQuery = $main.split(split.toSplitExpression(), SEGMENT);

      measures.forEach((measure) => {
        subQuery = subQuery.performAction(measure.toApplyAction());
      });

      var applyForSort = essence.getApplyForSort(sortAction);
      if (applyForSort) {
        subQuery = subQuery.performAction(applyForSort);
      }
      subQuery = subQuery.performAction(sortAction);

      if (limitAction) {
        subQuery = subQuery.performAction(limitAction);
      }

      if (i + 1 < splits.length()) {
        subQuery = subQuery.apply(SPLIT, makeQuery(i + 1));
      }

      return subQuery;
    }

    query = query.apply(SPLIT, makeQuery(0));

    this.setState({ loading: true });
    dataSource.executor(query)
      .then(
        (dataset) => {
          if (!this.mounted) return;
          this.setState({
            loading: false,
            dataset,
            error: null
          });
        },
        (error) => {
          if (!this.mounted) return;
          this.setState({
            loading: false,
            dataset: null,
            error
          });
        }
      );
  }

  componentDidMount() {
    this.mounted = true;
    var { essence } = this.props;
    this.fetchData(essence);
  }

  componentWillReceiveProps(nextProps: VisualizationProps) {
    var { essence } = this.props;
    var nextEssence = nextProps.essence;
    if (
      nextEssence.differentDataSource(essence) ||
      nextEssence.differentEffectiveFilter(essence, BarChart.id) ||
      nextEssence.differentSplits(essence) ||
      nextEssence.newSelectedMeasures(essence)
    ) {
      this.fetchData(nextEssence);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    var { clicker, essence, stage } = this.props;
    var { loading, error, dataset } = this.state;
    var { splits } = essence;

    var measure = essence.getMeasures().first();
    var measureName = measure.name;
    var getY = (d: Datum) => d[measureName];

    var bars: JSX.Element[] = null;
    if (dataset) {
      var myDatum: Datum = dataset.data[0];
      var myDataset: Dataset = myDatum[SPLIT];

      var extentY = d3.extent(myDataset.data, getY);

      if (isNaN(extentY[0])) {
        extentY = [0, 1];
      }

      extentY[0] = Math.min(extentY[0] * 1.1, 0);
      extentY[1] = Math.max(extentY[1] * 1.1, 0);

      var scaleY = d3.scale.linear()
        .domain(extentY)
        .range([stage.height, 0]);

      bars = myDataset.data.map((d, i) => {
        var segmentValue = d[SEGMENT];
        var segmentValueStr = String(segmentValue);

        return <rect
          key={segmentValueStr}
          x={i * 30 + 10}
          y={scaleY(getY(d))}
          width={20}
          height={Math.abs(scaleY(getY(d)) - scaleY(0))}
        />;
      });
    }

    var loader: JSX.Element = null;
    if (loading) {
      loader = <Loader/>;
    }

    var queryError: JSX.Element = null;
    if (error) {
      queryError = <QueryError error={error}/>;
    }

    return <div className="bar-chart">
      <svg width={stage.width} height={stage.height}>
        <g className="bars">
          {bars}
        </g>
      </svg>
      {queryError}
      {loader}
    </div>;
  }
}
