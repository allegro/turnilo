/*
 * Copyright 2017-2018 Allegro.pl
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

import * as sinon from "sinon";

var _sinon2 = _interopRequireDefault(sinon);

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
