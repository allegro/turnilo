/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2018 Allegro.pl
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
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as TestUtils from "react-dom/test-utils";
import * as sinon from "sinon";
import { DataCubeFixtures, TimekeeperFixtures } from "../../../common/models/fixtures";
import { DimensionMeasurePanel } from "../../components/dimension-measure-panel/dimension-measure-panel";
import { FilterTile } from "../../components/filter-tile/filter-tile";
import { SplitTile } from "../../components/split-tile/split-tile";
import * as localStorage from "../../utils/local-storage/local-storage";
import { mockReactComponent, renderIntoDocument } from "../../utils/test-utils";
import { CubeView } from "./cube-view";

describe("CubeView", () => {
  before(() => {
    mockReactComponent(DimensionMeasurePanel);
    mockReactComponent(FilterTile);
    mockReactComponent(SplitTile);
  });

  after(() => {
    (DimensionMeasurePanel as any).restore();
    (FilterTile as any).restore();
    (SplitTile as any).restore();
  });

  it("adds the correct class", () => {
    var updateViewHash = sinon.stub();
    const getEssenceFromHash = sinon.stub();
    const getCubeViewHash = sinon.stub();

    var renderedComponent = renderIntoDocument(
      <CubeView
        hash={null}
        initTimekeeper={TimekeeperFixtures.fixed()}
        dataCube={DataCubeFixtures.wiki()}
        updateViewHash={updateViewHash}
        stateful={false}
        getCubeViewHash={getCubeViewHash}
        getEssenceFromHash={getEssenceFromHash}
      />
    );

    expect(TestUtils.isCompositeComponent(renderedComponent), "should be composite").to.equal(true);
    expect(ReactDOM.findDOMNode(renderedComponent).className, "should contain class").to.contain("cube-view");

  });

  it("remembers measure mode toggle click", () => {
    var updateViewHash = sinon.stub();
    const getEssenceFromHash = sinon.stub();
    const getCubeViewHash = sinon.stub();
    var stub = sinon.stub(localStorage, "get");
    stub.withArgs("is-multi-measure").returns(undefined);

    var initialCubeView: any = renderIntoDocument(
      <CubeView
        hash={null}
        initTimekeeper={TimekeeperFixtures.fixed()}
        dataCube={DataCubeFixtures.wiki()}
        updateViewHash={updateViewHash}
        stateful={false}
        getCubeViewHash={getCubeViewHash}
        getEssenceFromHash={getEssenceFromHash}
      />
    );
    expect(initialCubeView.state.essence.multiMeasureMode, "default is single measure").to.equal(false);

    stub.restore();
    stub = sinon.stub(localStorage, "get");
    stub.withArgs("is-multi-measure").returns(true);

    var wikiCubeView: any = renderIntoDocument(
      <CubeView
        hash={null}
        initTimekeeper={TimekeeperFixtures.fixed()}
        dataCube={DataCubeFixtures.wiki()}
        updateViewHash={updateViewHash}
        stateful={false}
        getCubeViewHash={getCubeViewHash}
        getEssenceFromHash={getEssenceFromHash}
      />
    );

    expect(wikiCubeView.state.essence.multiMeasureMode, "multi measure in local storage is respected -> true").to.equal(true);

    stub.restore();
    stub = sinon.stub(localStorage, "get");
    stub.withArgs("is-multi-measure").returns(false);

    var wikiCubeView2: any = renderIntoDocument(
      <CubeView
        hash={null}
        initTimekeeper={TimekeeperFixtures.fixed()}
        dataCube={DataCubeFixtures.wiki()}
        updateViewHash={updateViewHash}
        stateful={false}
        getCubeViewHash={getCubeViewHash}
        getEssenceFromHash={getEssenceFromHash}
      />
    );

    expect(wikiCubeView2.state.essence.multiMeasureMode, "multi measure in local storage is respected -> false").to.equal(false);
  });
});
