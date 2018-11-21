/*
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
import { mount, shallow } from "enzyme";
import * as React from "react";
import * as sinon from "sinon";
import { EssenceFixtures } from "../../../common/models/essence/essence.fixtures";
import { MeasureFixtures } from "../../../common/models/measure/measure.fixtures";
import { Series } from "../../../common/models/series/series";
import { MeasureActions } from "./measure-actions-menu";

const onClose = () => {
};

describe("<MeasureActions>", () => {
  it("renders enabled add action when measure is not selected", () => {
    const actions = shallow(<MeasureActions
      measure={MeasureFixtures.wikiUniqueUsers()}
      essence={EssenceFixtures.wikiTable()}
      onClose={onClose}
      clicker={null}
    />);

    expect(actions.find(".add").hasClass("disabled")).to.be.false;
  });

  it("renders disabled add action when measure is selected", () => {
    const actions = shallow(<MeasureActions
      measure={MeasureFixtures.wikiCount()}
      essence={EssenceFixtures.wikiTable()}
      onClose={onClose}
      clicker={null}
    />);

    expect(actions.find(".add").hasClass("disabled")).to.be.true;
  });

  it("calls clicker and onClose when measure is not selected", () => {
    const onCloseSpy = sinon.spy();
    const addSeriesSpy = sinon.spy();
    const clicker = { addSeries: addSeriesSpy };
    const measure = MeasureFixtures.wikiUniqueUsers();
    const actions = mount(<MeasureActions
      measure={measure}
      essence={EssenceFixtures.wikiTable()}
      onClose={onCloseSpy}
      clicker={clicker}
    />);

    const add = actions.find(".add");
    add.simulate("click");

    expect(onCloseSpy.calledOnce).to.be.true;
    expect(addSeriesSpy.calledOnce).to.be.true;
    expect(addSeriesSpy.calledWith(Series.fromMeasure(measure))).to.be.true;
  });

  it("calls onClose but not clicker when measure is selected", () => {
    const onCloseSpy = sinon.spy();
    const addSeriesSpy = sinon.spy();
    const clicker = { addSeries: addSeriesSpy };
    const actions = mount(<MeasureActions
      measure={MeasureFixtures.wikiCount()}
      essence={EssenceFixtures.wikiTable()}
      onClose={onCloseSpy}
      clicker={clicker}
    />);

    const add = actions.find(".add");
    add.simulate("click");

    expect(onCloseSpy.calledOnce).to.be.true;
    expect(addSeriesSpy.notCalled).to.be.true;
  });
});
