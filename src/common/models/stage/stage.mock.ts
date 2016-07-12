/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import { Stage, StageJS } from './stage';

export class StageMock {
  public static get DEFAULT_A_JS(): StageJS {
    return {
      x: 10,
      y: 5,
      height: 2,
      width: 2
    };
  }

  public static get DEFAULT_B_JS(): StageJS {
    return {
      x: 10,
      y: 500,
      height: 2,
      width: 2
    };
  }

  public static get DEFAULT_C_JS(): StageJS {
    return {
      x: 10,
      y: 5,
      height: 3,
      width: 2
    };
  }

  static defaultA() {
    return Stage.fromJS(StageMock.DEFAULT_A_JS);
  }

  static defaultB() {
    return Stage.fromJS(StageMock.DEFAULT_B_JS);
  }
}
