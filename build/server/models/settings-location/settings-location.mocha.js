"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var immutable_class_tester_1 = require("immutable-class-tester");
var settings_location_1 = require("./settings-location");
describe("SettingsLocation", function () {
    it("is an immutable class", function () {
        immutable_class_tester_1.testImmutableClass(settings_location_1.SettingsLocation, [
            {
                location: "file",
                uri: "../private/lol.yaml"
            },
            {
                location: "mysql",
                uri: "mysql://root:@192.168.99.100:3306/datazoo"
            },
            {
                location: "mysql",
                uri: "mysql://root:@192.168.99.100:3306/datazoo",
                table: "swiv_state"
            }
        ]);
    });
    describe("gets the right format", function () {
        it("gets yaml", function () {
            var settingsLocation = settings_location_1.SettingsLocation.fromJS({
                location: "file",
                uri: "../private/lol.yaml"
            });
            chai_1.expect(settingsLocation.getFormat()).to.equal("yaml");
        });
    });
});
//# sourceMappingURL=settings-location.mocha.js.map