/*
 * Copyright 2017-2020 Allegro.pl
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

export type QueryDecoratorOptions = object;

interface QueryDecoratorDefinitionValue {
  path: string;
  options: QueryDecoratorOptions;
}

export interface QueryDecoratorDefinitionJS {
  path: string;
  options: object;
}

export class QueryDecoratorDefinition implements Instance<QueryDecoratorDefinitionValue, QueryDecoratorDefinitionJS> {

  static fromJS({ path, options }: QueryDecoratorDefinitionJS): QueryDecoratorDefinition {
    return new QueryDecoratorDefinition(path, options);
  }

  constructor(public path: string, public options: QueryDecoratorOptions) {
  }

  equals(other: Instance<QueryDecoratorDefinitionValue, QueryDecoratorDefinitionJS> | undefined): boolean {
    return other instanceof QueryDecoratorDefinition
      && this.path === other.path
      && dictEqual(this.options, other.options);
  }

  valueOf(): QueryDecoratorDefinitionValue {
    return {
      options: this.options,
      path: this.path
    };
  }

  toJS(): QueryDecoratorDefinitionJS {
    return {
      options: this.options,
      path: this.path
    };
  }

  toJSON(): QueryDecoratorDefinitionJS {
    return this.toJS();
  }
}
