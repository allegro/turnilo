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

import { expect } from "chai";
import { mount } from "enzyme";
import * as React from "react";
import { DataCubeFixtures } from "../../../common/models/data-cube/data-cube.fixtures";
import { TimekeeperFixtures } from "../../../common/models/timekeeper/timekeeper.fixtures";
import { noop } from "../../../common/utils/functional/functional";
import { Totals } from "../../visualizations/totals/totals";
import { CubeView } from "./cube-view";

describe("CubeView", () => {
  it("embeds correct Visualization component", () => {

    const cubeView = mount(
      <CubeView
        openAboutModal={noop}
        appSettings={null}
        hash={null}
        initTimekeeper={TimekeeperFixtures.fixed()}
        dataCube={DataCubeFixtures.wiki()}
        changeDataCubeAndEssence={null}
        getEssenceFromHash={null}
        changeEssence={null}
        urlForEssence={null}
      />
    );

    expect(cubeView.find(".visualization").find(Totals)).to.have.lengthOf(1);

    cubeView.unmount();
  });
});
