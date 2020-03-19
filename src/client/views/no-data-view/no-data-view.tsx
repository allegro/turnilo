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

import * as React from "react";
import { AppSettings } from "../../../common/models/app-settings/app-settings";
import { Customization } from "../../../common/models/customization/customization";
import { Fn } from "../../../common/utils/general/general";
import { HeaderBar } from "../../components/header-bar/header-bar";
import { SvgIcon } from "../../components/svg-icon/svg-icon";
import { STRINGS } from "../../config/constants";
import "./no-data-view.scss";

export type Mode = "no-cluster" | "no-cube";

export interface NoDataViewProps {
  appSettings?: AppSettings;
  onOpenAbout: Fn;
  customization?: Customization;
}

export interface NoDataViewState {
  mode?: Mode;
}

export class NoDataView extends React.Component <NoDataViewProps, NoDataViewState> {

  static NO_CLUSTER: Mode = "no-cluster";
  static NO_CUBE: Mode = "no-cube";

  constructor(props: NoDataViewProps) {
    super(props);
    this.state = {};
  }

  componentWillReceiveProps(nextProps: NoDataViewProps) {
    const { clusters } = nextProps.appSettings;

    if (!clusters || !clusters.length) {
      this.setState({
        mode: NoDataView.NO_CLUSTER
      });
    } else {
      this.setState({
        mode: NoDataView.NO_CUBE
      });
    }
  }

  renderTitle(): JSX.Element {
    const { mode } = this.state;
    return <div className="title">
      <div className="icon">
        <SvgIcon svg={require("../../icons/data-cubes.svg")} />
      </div>
      <div className="label">{mode === NoDataView.NO_CUBE ? STRINGS.noQueryableDataCubes : STRINGS.noConnectedData}</div>
    </div>;
  }

  render() {
    const { onOpenAbout, customization } = this.props;
    return <div className="no-data-view">
      <HeaderBar
        customization={customization}
        title={STRINGS.home}
      >
        <button className="text-button" onClick={onOpenAbout}>
          {STRINGS.infoAndFeedback}
        </button>
      </HeaderBar>
      <div className="container">
        {this.renderTitle()}
      </div>
    </div>;
  }
}
