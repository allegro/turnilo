require('./no-data-sources-application.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Stage, Clicker, Essence, DataSource, Filter, Dimension, Measure } from '../../../common/models/index';
// import { ... } from '../../config/constants';
import { SvgIcon } from '../svg-icon/svg-icon';

export interface NoDataSourcesApplicationProps extends React.Props<any> {
}

export interface NoDataSourcesApplicationState {
}

export class NoDataSourcesApplication extends React.Component<NoDataSourcesApplicationProps, NoDataSourcesApplicationState> {

  constructor() {
    super();

  }

  render() {
    return <div className="no-data-sources-application">
      <div className="icon">
        <SvgIcon svg={require('../../icons/datasources.svg')}/>
      </div>
      <p>There are no data sources configured</p>
    </div>;
  }
}
