function extend(obj1, obj2) {
  var newObj = {};
  for (var k in obj1) newObj[k] = obj1[k];
  for (var k in obj2) newObj[k] = obj2[k];
  return newObj;
}

module.exports = extend;
