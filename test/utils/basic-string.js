const Expression = require('plywood').Expression;

function basicString(thing) {
  return thing.name + ' ~ ' + Expression.fromJS(thing.expression).toString();
}

module.exports = basicString;
