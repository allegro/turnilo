"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expect = require("chai").expect;
var updater_1 = require("./updater");
function valueEqual(a, b) {
    return a.value === b.value;
}
describe("updater", function () {
    it("one enter", function () {
        var ops = [];
        updater_1.updater([], [{ name: "A" }], {
            equals: valueEqual,
            onEnter: function (newThing) {
                ops.push("Enter " + newThing.name);
            },
            onUpdate: function (newThing, oldThing) {
                ops.push("Update " + oldThing.name + " " + oldThing.value + " => " + newThing.value);
            },
            onExit: function (oldThing) {
                ops.push("Exit " + oldThing.name);
            }
        });
        expect(ops.join("; ")).to.equal("Enter A");
    });
    it("one exit", function () {
        var ops = [];
        updater_1.updater([{ name: "A" }], [], {
            equals: valueEqual,
            onEnter: function (newThing) {
                ops.push("Enter " + newThing.name);
            },
            onUpdate: function (newThing, oldThing) {
                ops.push("Update " + oldThing.name + " " + oldThing.value + " => " + newThing.value);
            },
            onExit: function (oldThing) {
                ops.push("Exit " + oldThing.name);
            }
        });
        expect(ops.join("; ")).to.equal("Exit A");
    });
    it("enter / exit", function () {
        var ops = [];
        updater_1.updater([{ name: "A" }], [{ name: "B" }], {
            equals: valueEqual,
            onEnter: function (newThing) {
                ops.push("Enter " + newThing.name);
            },
            onUpdate: function (newThing, oldThing) {
                ops.push("Update " + oldThing.name + " " + oldThing.value + " => " + newThing.value);
            },
            onExit: function (oldThing) {
                ops.push("Exit " + oldThing.name);
            }
        });
        expect(ops.join("; ")).to.equal("Enter B; Exit A");
    });
    it("enter / update / exit", function () {
        var ops = [];
        updater_1.updater([{ name: "A", value: 1 }, { name: "B", value: 2 }], [{ name: "B", value: 3 }, { name: "C", value: 4 }], {
            equals: valueEqual,
            onEnter: function (newThing) {
                ops.push("Enter " + newThing.name);
            },
            onUpdate: function (newThing, oldThing) {
                ops.push("Update " + oldThing.name + " " + oldThing.value + " => " + newThing.value);
            },
            onExit: function (oldThing) {
                ops.push("Exit " + oldThing.name);
            }
        });
        expect(ops.join("; ")).to.equal("Update B 2 => 3; Enter C; Exit A");
    });
});
//# sourceMappingURL=updater.mocha.js.map