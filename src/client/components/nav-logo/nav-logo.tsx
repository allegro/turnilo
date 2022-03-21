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
import "./nav-logo.scss";

export interface NavLogoProps {
  customLogoSvg: string;
}

export const NavLogo: React.FunctionComponent<NavLogoProps> = ({ customLogoSvg }) =>
  <div className="nav-logo">
    <div className="logo">
      <SvgIcon svg={customLogoSvg} />
    </div>
  </div>;
