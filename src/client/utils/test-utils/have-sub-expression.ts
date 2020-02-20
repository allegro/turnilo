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

import * as Chai from "chai";
import { Expression } from "plywood";
import some from "../../../common/utils/plywood/some";

export default function(chai: typeof Chai) {
  chai.Assertion.addMethod("haveSubExpression", function(exp: Expression) {
    this.assert(
      some(this._obj, e => exp.equals(e)),
      `expected to have expression ${exp.toString()}`,
      `expected to not have expression ${exp.toString()}`,
      exp,
      this._obj,
      true
    );
  });
}

declare global {
  namespace Chai {
    interface Assertion {
      haveSubExpression(exp: Expression): Assertion;
    }
  }
}
