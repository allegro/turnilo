/*
 * Copyright 2017-2022 Allegro.pl
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
import * as sinon from "sinon";
import * as FileModule from "../utils/file/file";
import { loadConfigFile } from "./load-config-file";

describe("loadConfigFile", () => {
  it("should pass path and yml format to loadFileSync", () => {
    const loadFileSync = sinon.stub(FileModule, "loadFileSync").returns("result");
    loadConfigFile("path", null as any);
    expect(loadFileSync.calledWith("path", "yaml")).to.be.true;
    loadFileSync.restore();
  });

  it("should call program.error with error message if loadFileSync throws", () => {
    const loadFileSync = sinon.stub(FileModule, "loadFileSync").throws(new Error("error-message"));
    const programSpy = { error: sinon.spy() };
    loadConfigFile("path", programSpy as any);
    expect(programSpy.error.calledWithMatch("error-message")).to.be.true;
    loadFileSync.restore();
  });
});
