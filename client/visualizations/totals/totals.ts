'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
// import * as Icon from 'react-svg-icons';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Stage, SplitCombine, Filter, Dimension, Measure, DataSource, Clicker } from "../../models/index";
// import { SomeComp } from '../some-comp/some-comp';

interface TotalsProps {
  clicker: Clicker;
  dataSource: DataSource;
  filter: Filter;
  splits: List<SplitCombine>;
  measures: List<Measure>;
  stage: Stage;
}

interface TotalsState {
  dataset?: Dataset;
  dragStart?: number;
}

export class Totals extends React.Component<TotalsProps, TotalsState> {
  public mounted: boolean;

  constructor() {
    super();
    // this.state = {};

  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentWillReceiveProps(nextProps: TotalsProps) {

  }

  render() {
    return JSX(`
      <div className="totals">
        TOTALS YO
      </div>
    `);
  }
}
