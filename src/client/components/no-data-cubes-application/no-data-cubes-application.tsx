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

require('./no-data-cubes-application.css');

import * as React from 'react';
import { STRINGS } from '../../config/constants';
import { SvgIcon } from '../svg-icon/svg-icon';

export interface NoDataCubesApplicationProps extends React.Props<any> {
}

export interface NoDataCubesApplicationState {
}

export class NoDataCubesApplication extends React.Component<NoDataCubesApplicationProps, NoDataCubesApplicationState> {
  private refreshTimer: any;

  constructor() {
    super();

  }

  componentDidMount() {
    this.refreshTimer = setInterval(() => {
      if (typeof window !== 'undefined') window.location.reload(true);
    }, 10000);
  }

  componentWillUnmount() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  render() {
    return <div className="no-data-cubes-application">
      <div className="icon">
        <SvgIcon svg={require('../../icons/data-cubes.svg')}/>
      </div>
      <p>{STRINGS.noQueryableDataCubes}</p>
    </div>;
  }
}
