'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
import * as numeral from 'numeral';
// import * as Icon from 'react-svg-icons';
import { $, Expression, Executor, Dataset } from 'plywood';
import { hasOwnProperty } from '../../utils/general';
import { Stage, Essence, Splits, SplitCombine, Filter, Dimension, Measure, DataSource, Clicker, VisualizationProps, Resolve } from "../../models/index";
// import { SomeComp } from '../some-comp/some-comp';

interface TotalsState {
  dataset?: Dataset;
}

export class Totals extends React.Component<VisualizationProps, TotalsState> {
  static id = 'totals';
  static title = 'Totals';
  static handleCircumstance(dataSource: DataSource, splits: Splits): Resolve {
    return splits.length() ? Resolve.AUTOMATIC : Resolve.READY;
  }

  public mounted: boolean;

  constructor() {
    super();
    this.state = {
      dataset: null
    };
  }

  fetchData(essence: Essence): void {
    var { dataSource } = essence;
    var measures = essence.getMeasures();

    var $main = $('main');

    var query: any = $()
      .apply('main', $main.filter(essence.getEffectiveFilter(Totals.id).toExpression()));

    measures.forEach((measure) => {
      query = query.apply(measure.name, measure.expression);
    });

    dataSource.executor(query).then((dataset) => {
      if (!this.mounted) return;
      this.setState({ dataset });
    });
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
    var { dataset } = this.state;

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

    return JSX(`
      <div className="totals">
        {totals}
      </div>
    `);
  }
}
