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

require('./shpitz.css');

import * as React from 'react';
import { classNames } from '../../utils/dom/dom';

export interface ShpitzProps extends React.Props<any> {
  direction: string;
  style?: any;
}

export interface ShpitzState {
}

export class Shpitz extends React.Component<ShpitzProps, ShpitzState> {

  constructor() {
    super();

  }

  render() {
    const { direction, style } = this.props;

    return <div className={classNames('shpitz', direction)} style={style}>
      <div className="rectangle"></div>
    </div>;
  }
}
