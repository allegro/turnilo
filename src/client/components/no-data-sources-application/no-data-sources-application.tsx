require('./no-data-sources-application.css');

import * as React from 'react';
import { STRINGS } from '../../config/constants';
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
      <p>{STRINGS.noQueryableDataSources}</p>
    </div>;
  }
}
