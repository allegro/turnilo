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
import { spy } from "sinon";
import { sleep } from "../../../client/utils/test-utils";
import { Deferred, timeout } from "./promise";

describe("Promise utils", () => {
  describe("timeout", () => {
    it("should reject after defined timeout in ms", async () => {
      const successSpy = spy();
      const failureSpy = spy();
      timeout(10).then(successSpy).catch(failureSpy);
      expect(successSpy.called).to.be.false;
      expect(failureSpy.called).to.be.false;
      await sleep(10);
      expect(successSpy.called).to.be.false;
      expect(failureSpy.called).to.be.true;
    });
  });

  describe("Deferred", () => {
    it("should resolve with method", async () => {
      const onResolve = spy();
      const deferred = new Deferred<string>();
      const promise = deferred.promise;
      promise.then(onResolve);

      deferred.resolve("resolve");
      await promise;
      expect(onResolve.calledOnce).to.be.true;
      expect(onResolve.calledWith("resolve")).to.be.true;
    });

    it("should reject with method", async () => {
      const onReject = spy();
      const deferred = new Deferred<string>();
      const promise = deferred.promise;
      promise.catch(onReject);

      deferred.reject("reject");
      try {
        await promise;
      } catch {
        // empty catch for promise rejection
      }
      expect(onReject.calledOnce).to.be.true;
      expect(onReject.calledWith("reject")).to.be.true;
    });

  });
});
