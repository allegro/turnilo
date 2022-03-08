/*
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
import { mount, shallow } from "enzyme";
import React from "react";
import * as sinon from "sinon";
import { SinonSpy } from "sinon";
import { ArithmeticExpression } from "../../../common/models/expression/concreteArithmeticOperation";
import { ExpressionSeriesOperation } from "../../../common/models/expression/expression";
import { Measure } from "../../../common/models/measure/measure";
import { MeasureFixtures } from "../../../common/models/measure/measure.fixtures";
import { ExpressionSeries } from "../../../common/models/series/expression-series";
import { noop } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { AddArithmeticOperationButton } from "./add-arithmetic-operation";

const renderButton = (measure: Measure) => shallow(<AddArithmeticOperationButton
  measure={measure}
  addPartialSeries={null}
  onClose={noop}
/>);

const mountButton = (measure: Measure, addExpressionPlaceholder: Fn, onClose: Fn) => mount(<AddArithmeticOperationButton
  measure={measure}
  onClose={onClose}
  addPartialSeries={addExpressionPlaceholder} />)
  .find(".new-arithmetic-expression");

describe("Add Arithmetic Operation Button", () => {

  it("renders enabled add arithmetic operation", () => {
    const actions = renderButton(MeasureFixtures.wikiUniqueUsers());

    expect(actions.find(".new-arithmetic-expression")).to.be.length(1);
  });

  describe("click action", () => {
    let onCloseSpy: SinonSpy;
    let addExpressionPlaceholderSpy: SinonSpy;
    let measure: Measure;

    beforeEach(() => {
      onCloseSpy = sinon.spy();
      addExpressionPlaceholderSpy = sinon.spy();
      measure = MeasureFixtures.wikiUniqueUsers();
      const addButton = mountButton(measure, addExpressionPlaceholderSpy, onCloseSpy);
      addButton.simulate("click");
    });

    it("calls addExpressionPlaceholder", () => {
      expect(addExpressionPlaceholderSpy.calledOnce).to.be.true;
      const argument = addExpressionPlaceholderSpy.args[0][0];
      const expectedExpression = new ExpressionSeries({
        reference: measure.name,
        expression: new ArithmeticExpression({
          operation: ExpressionSeriesOperation.ADD,
          reference: null
        })
      });
      expect(argument.equals(expectedExpression)).to.be.true;
    });

    it("calls onClose", () => {
      expect(onCloseSpy.calledOnce).to.be.true;
    });
  });
});
