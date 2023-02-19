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
import * as sinon from "sinon";
import * as customizationModule from "../customization/customization";
import * as oauthModule from "../oauth/oauth";
import { fromConfig, serialize } from "./app-settings";
import { appSettings } from "./app-settings.fixtures";

describe("AppSettings", () => {

  describe("fromConfig", () => {
    it("should read client timeout", () => {
      const settings = fromConfig({ clientTimeout: 42 });

      expect(settings).to.contain({ clientTimeout: 42 });
    });

    it("should read version", () => {
      const settings = fromConfig({ version: 42 });

      expect(settings).to.contain({ version: 42 });
    });

    describe("oauth", () => {
      let oauthFromConfig: sinon.SinonStub;

      beforeEach(() => {
        oauthFromConfig = sinon
          .stub(oauthModule, "fromConfig")
          .returns({ foobar: true });
      });

      afterEach(() => {
        oauthFromConfig.restore();
      });

      it("should call oauth fromConfig", () => {
        fromConfig({ oauth: { input: 42 } } as any);

        expect(oauthFromConfig.calledWith({ input: 42 })).to.be.true;
      });

      it("should use result of customization fromConfig", () => {
        const settings = fromConfig({ oauth: { input: 42 } } as any);

        expect(settings).to.deep.contain({
          oauth: {
            foobar: true
          }
        });
      });
    });

    describe("customization", () => {
      let customizationFromConfig: sinon.SinonStub;

      beforeEach(() => {
        customizationFromConfig = sinon
          .stub(customizationModule, "fromConfig")
          .returns({ foobar: true });
      });

      afterEach(() => {
        customizationFromConfig.restore();
      });

      it("should call customization fromConfig", () => {
        fromConfig({ customization: { input: 42 } } as any);

        expect(customizationFromConfig.calledWith({ input: 42 })).to.be.true;
      });

      it("should use result of customization fromConfig", () => {
        const settings = fromConfig({ customization: { input: 42 } } as any);

        expect(settings).to.deep.contain({
          customization: {
            foobar: true
          }
        });
      });
    });
  });

  describe("serialize", () => {
    it("should pass clientTimeout", () => {
      const serialized = serialize({ ...appSettings, clientTimeout: 42 });

      expect(serialized).to.contain({ clientTimeout: 42 });
    });

    it("should pass version", () => {
      const serialized = serialize({ ...appSettings, version: 42 });

      expect(serialized).to.contain({ version: 42 });
    });

    describe("oauth", () => {
      let oauthSerialize: sinon.SinonStub;

      beforeEach(() => {
        oauthSerialize = sinon
          .stub(oauthModule, "serialize")
          .returns({ foobar: true });
      });

      afterEach(() => {
        oauthSerialize.restore();
      });

      it("should call oauth serialize", () => {
        serialize({ ...appSettings, oauth: { input: 42 } } as any);

        expect(oauthSerialize.calledWith({ input: 42 })).to.be.true;
      });

      it("should use result of oauth serialize", () => {
        const serialized = serialize({ ...appSettings, oauth: { input: 42 } } as any);

        expect(serialized).to.deep.contain({
          oauth: {
            foobar: true
          }
        });
      });
    });

    describe("customization", () => {
      let customizationSerialize: sinon.SinonStub;

      beforeEach(() => {
        customizationSerialize = sinon
          .stub(customizationModule, "serialize")
          .returns({ foobar: true });
      });

      afterEach(() => {
        customizationSerialize.restore();
      });

      it("should call customization serialize", () => {
        serialize({ ...appSettings, customization: { input: 42 } } as any);

        expect(customizationSerialize.calledWith({ input: 42 })).to.be.true;
      });

      it("should use result of customization serialize", () => {
        const serialized = serialize({ ...appSettings, customization: { input: 42 } } as any);

        expect(serialized).to.deep.contain({
          customization: {
            foobar: true
          }
        });
      });
    });
  });
});
