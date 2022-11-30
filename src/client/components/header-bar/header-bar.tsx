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
import { useSettingsContext } from "../../views/cube-view/settings-context";
import "./header-bar.scss";

export interface HeaderBarProps {
  title?: string;
}

export const HeaderBar: React.FunctionComponent<HeaderBarProps> = props => {
  const { title } = props;
  const { customization } = useSettingsContext();

  const headerStyle: React.CSSProperties = customization && customization.headerBackground && { background: customization.headerBackground };

  return <header className="header-bar" style={headerStyle}>
    <div className="left-bar">
      <div className="title">{title}</div>
    </div>
    <div className="right-bar">
      {props.children}
    </div>
  </header>;
};
