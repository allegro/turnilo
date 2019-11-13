var _sinon = require('sinon');
var _sinon2 = _interopRequireDefault(_sinon);

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj: any) { return obj && obj.__esModule ? obj : { default: obj }; }

export var mockReq = exports.mockReq = function mockReq() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var ret = {};
  return Object.assign(ret, {
    accepts: _sinon2.default.stub().returns(ret),
    acceptsCharsets: _sinon2.default.stub().returns(ret),
    acceptsEncodings: _sinon2.default.stub().returns(ret),
    acceptsLanguages: _sinon2.default.stub().returns(ret),
    body: {},
    flash: _sinon2.default.stub().returns(ret),
    get: _sinon2.default.stub().returns(ret),
    header: _sinon2.default.stub().returns(ret),
    is: _sinon2.default.stub().returns(ret),
    params: {},
    query: {},
    session: {},
    headers: {}
  }, options);
};
