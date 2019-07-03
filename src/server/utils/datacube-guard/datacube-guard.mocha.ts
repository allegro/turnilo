/*
 * Copyright 2019 Wirtualna Polska Media S.A.
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

import { checkAccess } from "./datacube-guard";
import { Request } from "express";

const assert = require('assert');

describe('Guard test', ()=> {
	it('Guard off -> access to all dataCubes', ()=>{
		var req = {
			headers: {}
		}
		var dataCube = {
			name: "some-name",
			cluster: {
				guardDataCubes: false
			}
		}
        assert.equal(checkAccess(dataCube, req), true);
    })

	it('Guard on -> access denied', ()=>{
		var req = {
			headers: {}
		}
		var dataCube = {
			name: "some-name",
			cluster: {
				guardDataCubes: true
			}
		}
        assert.equal(checkAccess(dataCube, req), false);
    })

	it('Guard on -> access denied', ()=>{
		var req = {
			headers: {
				"x-turnilo-allow-datacubes": "some,name"
			}
		}
		var dataCube = {
			name: "some-name",
			cluster: {
				guardDataCubes: true
			}
		}
        assert.equal(checkAccess(dataCube, req), false);
    })

	it('Guard on -> access allowed: wildchar', ()=>{
		var req = {
			headers: {
				"x-turnilo-allow-datacubes": "*,some-other-name"
			}
		}
		var dataCube = {
			name: "some-name",
			cluster: {
				guardDataCubes: true
			}
		}
        assert.equal(checkAccess(dataCube, req), true);
    })

	it('Guard on -> access allowed: datacube allowed', ()=>{
		var req = {
			headers: {
				"x-turnilo-allow-datacubes": "some-name,some-other-name"
			}
		}
		var dataCube = {
			name: "some-name",
			cluster: {
				guardDataCubes: true
			}
		}
        assert.equal(checkAccess(dataCube, req), true);
    })
})
