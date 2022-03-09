/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2019 Allegro.pl
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

import React from "react";
import { SvgIcon } from "../svg-icon/svg-icon";
import "./loader.scss";

export interface LoaderProps {
}

export interface LoaderState {
}

export class Loader extends React.Component<LoaderProps, LoaderState> {

  render() {
    return <div className="loader">
      <SvgIcon svg={require("../../icons/grid-loader.svg")} />
    </div>;
  }
}
