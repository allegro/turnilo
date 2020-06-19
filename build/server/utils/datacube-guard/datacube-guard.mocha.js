"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var data_cube_fixtures_1 = require("../../../common/models/data-cube/data-cube.fixtures");
var datacube_guard_1 = require("./datacube-guard");
function mockHeaders(allowedDataCubes) {
    var _a;
    return _a = {}, _a[datacube_guard_1.allowDataCubesHeaderName] = allowedDataCubes, _a;
}
describe("Guard test", function () {
    it("Guard off -> header for cube A and accessing cube B", function () {
        var dataCubeB = data_cube_fixtures_1.DataCubeFixtures.customCubeWithGuard();
        dataCubeB.name = "cubeB";
        dataCubeB.cluster.guardDataCubes = false;
        chai_1.expect(datacube_guard_1.checkAccess(dataCubeB, mockHeaders("cubeA"))).to.equal(true);
    });
    it("Guard off -> access to all dataCubes", function () {
        var dataCube = data_cube_fixtures_1.DataCubeFixtures.customCubeWithGuard();
        dataCube.cluster.guardDataCubes = false;
        chai_1.expect(datacube_guard_1.checkAccess(dataCube, mockHeaders(""))).to.equal(true);
    });
    it("Guard on -> access denied", function () {
        chai_1.expect(datacube_guard_1.checkAccess(data_cube_fixtures_1.DataCubeFixtures.customCubeWithGuard(), mockHeaders(""))).to.equal(false);
    });
    it("Guard on -> access denied", function () {
        chai_1.expect(datacube_guard_1.checkAccess(data_cube_fixtures_1.DataCubeFixtures.customCubeWithGuard(), mockHeaders("some,name"))).to.equal(false);
    });
    it("Guard on -> access allowed: wildchar", function () {
        var dataCube = data_cube_fixtures_1.DataCubeFixtures.customCubeWithGuard();
        chai_1.expect(datacube_guard_1.checkAccess(dataCube, mockHeaders("*,some-other-name"))).to.equal(true);
    });
    it("Guard on -> access allowed: datacube allowed", function () {
        var dataCube = data_cube_fixtures_1.DataCubeFixtures.customCubeWithGuard();
        chai_1.expect(datacube_guard_1.checkAccess(dataCube, mockHeaders("some-name,some-other-name"))).to.equal(true);
    });
});
//# sourceMappingURL=datacube-guard.mocha.js.map