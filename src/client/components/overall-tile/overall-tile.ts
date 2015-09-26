'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
// import * as Icon from 'react-svg-icons';
import * as numeral from 'numeral';
import { ply, $, Expression, Executor, Dataset } from 'plywood';
import { Stage, Clicker, Essence, DataSource, Filter, Dimension, Measure, TimePreset } from '../../../common/models/index';
// import { ... } from '../../config/constants';
// import { SomeComp } from '../some-comp/some-comp';

export interface OverallTileProps {
  clicker: Clicker;
  essence: Essence;
}

export interface OverallTileState {
  loading?: boolean;
  dataset?: Dataset;
  error?: any;
}

export class OverallTile extends React.Component<OverallTileProps, OverallTileState> {
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
    var measure = essence.getPinnedSortMeasure();

    var query: any = ply()
      .apply('main', $('main').filter(essence.getEffectiveFilter().toExpression()))
      .apply('measure', measure.expression);

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

  componentWillReceiveProps(nextProps: OverallTileProps) {
    var { essence } = this.props;
    var nextEssence = nextProps.essence;
    if (
      essence.differentDataSource(nextEssence) ||
      essence.differentEffectiveFilter(nextEssence)
    ) {
      this.fetchData(nextEssence);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    var { clicker, essence } = this.props;
    var { loading, dataset, error } = this.state;
    var measure = essence.getPinnedSortMeasure();

    var measureValue: string = '-';
    if (dataset) {
      measureValue = numeral(dataset.data[0]['measure']).format(measure.format);
    }

    return JSX(`
      <div className="overall-tile">
        <div className="overall-label">Total {measure.title}</div>
        <div className="measure-value">{measureValue}</div>
      </div>
    `);
  }
}
