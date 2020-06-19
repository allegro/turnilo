"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bodyParser = require("body-parser");
var express = require("express");
var supertest = require("supertest");
var app_settings_fixtures_1 = require("../../../common/models/app-settings/app-settings.fixtures");
var customization_1 = require("../../../common/models/customization/customization");
var url_shortener_fixtures_1 = require("../../../common/models/url-shortener/url-shortener.fixtures");
var shorten_1 = require("./shorten");
var shortenPath = "/shorten";
var settingsGetterFactory = function (urlShortener) { return function () { return Promise.resolve(app_settings_fixtures_1.AppSettingsFixtures.wikiOnly().changeCustomization(customization_1.Customization.fromJS({
    urlShortener: urlShortener
}))); }; };
var callShortener = function (app) { return supertest(app)
    .get(shortenPath)
    .set("Content-Type", "application/json")
    .send({ url: "http://foobar.com?bazz=quvx" }); };
describe("url shortener", function () {
    var app;
    var server;
    describe("with succesful shortener", function () {
        before(function (done) {
            app = express();
            app.use(shortenPath, shorten_1.shortenRouter(settingsGetterFactory(url_shortener_fixtures_1.SuccessUrlShortenerJS)));
            server = app.listen(0, done);
        });
        after(function (done) {
            server.close(done);
        });
        it("should shorten url", function (testComplete) {
            callShortener(app)
                .expect("Content-Type", "application/json; charset=utf-8")
                .expect(200)
                .expect({ shortUrl: "http://foobar" }, testComplete);
        });
    });
    describe("without failing shortener", function () {
        before(function (done) {
            app = express();
            app.use(shortenPath, shorten_1.shortenRouter(settingsGetterFactory(url_shortener_fixtures_1.FailUrlShortenerJS)));
            app.use(bodyParser.json());
            server = app.listen(0, done);
        });
        after(function (done) {
            server.close(done);
        });
        it("should return error", function (testComplete) {
            callShortener(app)
                .expect("Content-Type", "application/json; charset=utf-8")
                .expect(500)
                .expect({ error: "could not shorten url", message: "error message" }, testComplete);
        });
    });
});
//# sourceMappingURL=shorten.mocha.js.map