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

import { expect, use } from "chai";
import { RefExpression } from "plywood";
import sinon from "sinon";
import equivalent from "../../client/utils/test-utils/equivalent";
import { NOOP_LOGGER } from "../../common/logger/logger";
import * as SourcesModule from "../../common/models/app-settings/app-settings";
import { emptySettings } from "../../common/models/app-settings/app-settings";
import { fromConfig } from "../../common/models/cluster/cluster";
import * as AppSettingsModule from "../../common/models/sources/sources";
import { ServerSettings } from "../models/server-settings/server-settings";
import buildSettings, { settingsForDatasetFile, settingsForDruidConnection } from "./build-settings";

use(equivalent);

describe("Build Settings", () => {
  describe("settingsForDatasetFile", () => {
    const settings = settingsForDatasetFile("path/to/file.json", "time", {
      verbose: true,
      port: 42,
      serverHost: "foobar",
      serverRoot: "qvux"
    });

    it("should create empty app settings", () => {
      expect(settings.appSettings).to.be.deep.equal(emptySettings(NOOP_LOGGER));
    });

    it("should create empty cluster array", () => {
      expect(settings.sources.clusters).to.be.deep.equal([]);
    });

    it("should pass options to server settings constructor and create object", () => {
      expect(settings.serverSettings).to.be.equivalent(ServerSettings.fromJS({
        verbose: true,
        port: 42,
        serverHost: "foobar",
        serverRoot: "qvux"
      }));
    });

    it("should create one data cube", () => {
      expect(settings.sources.dataCubes.length).to.be.equal(1);
    });

    it("should pass path as source to data cube", () => {
      expect(settings.sources.dataCubes[0].source).to.be.equal("path/to/file.json");
    });

    it("should set filename as data cube name", () => {
      expect(settings.sources.dataCubes[0].name).to.be.equal("file");
    });

    it("should set data cube cluster name to 'native'", () => {
      expect(settings.sources.dataCubes[0].clusterName).to.be.equal("native");
    });

    it("should pass time attribute to data cube", () => {
      expect(settings.sources.dataCubes[0].timeAttribute).to.be.equivalent(RefExpression.fromJS({
        name: "time"
      }));
    });
  });

  describe("settingsForDruidConnection", () => {
    const settings = settingsForDruidConnection("http://druid-url.com", {
      verbose: true,
      port: 42,
      serverHost: "foobar",
      serverRoot: "qvux"
    }, {
      type: "http-basic",
      password: "secret",
      username: "foobar"
    });

    it("should create empty app settings", () => {
      expect(settings.appSettings).to.be.deep.equal(emptySettings(NOOP_LOGGER));
    });

    it("should create empty data cubes array", () => {
      expect(settings.sources.dataCubes).to.be.deep.equal([]);
    });

    it("should pass options to server settings constructor and create object", () => {
      expect(settings.serverSettings).to.be.equivalent(ServerSettings.fromJS({
        verbose: true,
        port: 42,
        serverHost: "foobar",
        serverRoot: "qvux"
      }));
    });

    it("should create one cluster", () => {
      expect(settings.sources.clusters.length).to.be.equal(1);
    });

    it("should pass url to cluster", () => {
      expect(settings.sources.clusters[0].url).to.be.equal("http://druid-url.com");
    });

    it("should set 'druid' as cluster name", () => {
      expect(settings.sources.clusters[0].name).to.be.equal("druid");
    });

    it("should pass auth to cluster", () => {
      expect(settings.sources.clusters[0].auth).to.be.deep.equal({
        type: "http-basic",
        password: "secret",
        username: "foobar"
      });
    });
  });

  describe("buildSettings", () => {
    it("should pass config to AppSettings fromConfig function", () => {
      const appSettingsFromConfigStub = sinon.stub(AppSettingsModule, "fromConfig").returns("app-settings");
      buildSettings({ config: true }, {});
      expect(appSettingsFromConfigStub.calledWith({ config: true })).to.be.true;
      appSettingsFromConfigStub.restore();
    });

    it("should pass config to Sources fromConfig function", () => {
      const sourcesFromConfigStub = sinon.stub(SourcesModule, "fromConfig").returns("sources");
      buildSettings({ config: true }, {});
      expect(sourcesFromConfigStub.calledWith({ config: true })).to.be.true;
      sourcesFromConfigStub.restore();
    });

    it("should pass merged config and options to ServerSettings.fromJS", () => {
      const serverSettingsFromJSSStub = sinon.stub(ServerSettings, "fromJS").returns("server-settings");
      buildSettings({ config: true }, { options: true } as any);
      expect(serverSettingsFromJSSStub.calledWith({ config: true, options: true })).to.be.true;
      serverSettingsFromJSSStub.restore();
    });

    it("should pass auth object to all clusters", () => {
      const makeCluster = (name: string) => fromConfig({ name, url: `https://${name}.com` }, NOOP_LOGGER);

      const settings = buildSettings({
        clusters: [makeCluster("foobar-1"), makeCluster("foobar-2")]
      }, {}, { type: "http-basic", password: "secret", username: "foobar" });

      expect(settings.sources.clusters[0].auth).to.be.deep.equal({
        type: "http-basic", password: "secret", username: "foobar"
      });

      expect(settings.sources.clusters[1].auth).to.be.deep.equal({
        type: "http-basic", password: "secret", username: "foobar"
      });
    });
  });
});
