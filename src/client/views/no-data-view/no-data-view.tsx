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

export interface NoDataViewProps {
  appSettings?: AppSettings;
  onOpenAbout: Fn;
  customization?: Customization;
}

function label(appSettings: AppSettings): string {
  const { clusters } = appSettings;

  const hasClusters = clusters && clusters.length > 0;
  return !hasClusters ? STRINGS.noConnectedData : STRINGS.noQueryableDataCubes;
}

const NoDataTitle: React.SFC<{ appSettings: AppSettings }> = props => {
  return <div className="title">
    <div className="icon">
      <SvgIcon svg={require("../../icons/data-cubes.svg")} />
    </div>
    <div className="label">{label(props.appSettings)}</div>
  </div>;
};

export const NoDataView: React.SFC<NoDataViewProps> = props => {
  const { onOpenAbout, customization, appSettings } = props;
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
      <NoDataTitle appSettings={appSettings} />
    </div>
  </div>;
};
