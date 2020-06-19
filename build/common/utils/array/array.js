"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function move(array, oldIndex, newIndex) {
    array.splice(newIndex, 0, array.splice(oldIndex, 1)[0]);
}
exports.move = move;
function indexByAttribute(array, key, value) {
    if (!array || !array.length)
        return -1;
    var n = array.length;
    for (var i = 0; i < n; i++) {
        if (array[i][key] === value)
            return i;
    }
    return -1;
}
exports.indexByAttribute = indexByAttribute;
function insert(array, index, element) {
    return array.slice(0, index).concat([element], array.slice(index));
}
exports.insert = insert;
function shallowEqualArrays(a, b) {
    if (a === b)
        return true;
    if (!a || !b)
        return false;
    if (b.length !== a.length)
        return false;
    for (var i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}
exports.shallowEqualArrays = shallowEqualArrays;
//# sourceMappingURL=array.js.map