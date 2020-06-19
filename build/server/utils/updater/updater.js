"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var immutable_class_1 = require("immutable-class");
var functional_1 = require("../../../common/utils/functional/functional");
var general_1 = require("../../../common/utils/general/general");
function getName(thing) {
    return thing.name;
}
function updater(oldThings, newThings, updatedOptions) {
    var key = updatedOptions.key || getName;
    var equals = updatedOptions.equals || immutable_class_1.immutableEqual;
    var onEnter = updatedOptions.onEnter || functional_1.noop;
    var onUpdate = updatedOptions.onUpdate || functional_1.noop;
    var onExit = updatedOptions.onExit || functional_1.noop;
    var initialByKey = {};
    for (var _i = 0, oldThings_1 = oldThings; _i < oldThings_1.length; _i++) {
        var initialThing = oldThings_1[_i];
        var initialThingKey = key(initialThing);
        if (initialByKey[initialThingKey])
            throw new Error("duplicate key '" + initialThingKey + "'");
        initialByKey[initialThingKey] = initialThing;
    }
    for (var _a = 0, newThings_1 = newThings; _a < newThings_1.length; _a++) {
        var newThing = newThings_1[_a];
        var newThingKey = key(newThing);
        var oldThing = initialByKey[newThingKey];
        if (oldThing) {
            if (!equals(newThing, oldThing)) {
                onUpdate(newThing, oldThing);
            }
            delete initialByKey[newThingKey];
        }
        else {
            onEnter(newThing);
        }
    }
    for (var k in initialByKey) {
        if (!general_1.hasOwnProperty(initialByKey, k))
            continue;
        onExit(initialByKey[k]);
    }
}
exports.updater = updater;
//# sourceMappingURL=updater.js.map