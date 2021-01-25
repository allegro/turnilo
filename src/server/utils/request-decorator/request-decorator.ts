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

import { Instance } from "immutable-class";
import { dictEqual } from "plywood";
import { DruidRequestDecorator } from "plywood-druid-requester";
import { Logger } from "../../../common/logger/logger";
import { Cluster } from "../../../common/models/cluster/cluster";
import { isNil } from "../../../common/utils/general/general";

export interface RequestDecoratorFactoryParams {
  options: object;
  cluster: Cluster;
}

export interface DruidRequestDecoratorModule {
  version: number;
  druidRequestDecoratorFactory: (logger: Logger, params: RequestDecoratorFactoryParams) => DruidRequestDecorator;
}

type RequestDecoratorOptions = object;

interface RequestDecoratorValue {
  path: string;
  options: RequestDecoratorOptions;
}

export interface RequestDecoratorJS {
  path: string;
  options?: object;
}

export class RequestDecorator implements Instance<RequestDecoratorValue, RequestDecoratorJS> {

  static fromJS({ path, options }: RequestDecoratorJS): RequestDecorator {
    if (isNil(path)) throw new Error("RequestDecorator must have a path");
    return new RequestDecorator(path, options);
  }

  constructor(public path: string, public options: object = {}) {
  }

  equals(other: Instance<RequestDecoratorValue, RequestDecoratorJS> | undefined): boolean {
    return other instanceof RequestDecorator
      && this.path === other.path
      && dictEqual(this.options, other.options);
  }

  toJS(): RequestDecoratorJS {
    return {
      options: this.options,
      path: this.path
    };
  }

  toJSON(): RequestDecoratorJS {
    return this.toJS();
  }

  valueOf(): RequestDecoratorValue {
    return {
      options: this.options,
      path: this.path
    };
  }
}
