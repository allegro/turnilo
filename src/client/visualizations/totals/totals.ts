'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
import * as numeral from 'numeral';
// import * as Icon from 'react-svg-icons';
import { $, ply, Expression, Executor, Dataset } from 'plywood';
import { hasOwnProperty } from '../../../common/utils/general/general';
import { Stage, Essence, Splits, SplitCombine, Filter, Dimension, Measure, DataSource, Clicker, VisualizationProps, Resolve } from "../../../common/models/index";
import { Loader } from '../../components/loader/loader';
import { QueryError } from '../../components/query-error/query-error';

interface TotalsState {
  loading?: boolean;
  dataset?: Dataset;
  error?: any;
}

export class Totals extends React.Component<VisualizationProps, TotalsState> {
  static id = 'totals';
  static title = 'Totals';
  static handleCircumstance(dataSource: DataSource, splits: Splits): Resolve {
    if (!splits.length()) return Resolve.READY;
    return Resolve.automatic(() => {
      return Splits.EMPTY;
    });
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
    var { dataSource } = essence;
    var measures = essence.getMeasures();

    var $main = $('main');

    var query = ply()
      .apply('main', $main.filter(essence.getEffectiveFilter(Totals.id).toExpression()));

    measures.forEach((measure) => {
      query = query.apply(measure.name, measure.expression);
    });

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
      essence.differentEffectiveFilter(nextEssence, Totals.id) ||
      essence.differentSelectedMeasures(nextEssence)
    ) {
      this.fetchData(nextEssence);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    var { essence } = this.props;
    var { loading, dataset, error } = this.state;

    var myDatum = dataset ? dataset.data[0] : null;

    var totals = essence.getMeasures().map(measure => {
      var measureName = measure.name;

      var measureValueStr = '-';
      if (myDatum && hasOwnProperty(myDatum, measureName)) {
        measureValueStr = numeral(myDatum[measureName]).format(measure.format);
      }

      return JSX(`
        <div className="total" key={measure.name}>
          <div className="measure-name">{measure.title}</div>
          <div className="measure-value">{measureValueStr}</div>
        </div>
      `);
    });

    var loader: React.ReactElement<any> = null;
    if (loading) {
      loader = React.createElement(Loader, null);
    }

    var queryError: React.ReactElement<any> = null;
    if (error) {
      queryError = React.createElement(QueryError, { error });
    }

    return JSX(`
      <div className="totals">
        {totals}
        {queryError}
        {loader}
      </div>
    `);
  }
}
