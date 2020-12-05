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

import { Request } from "express";
import { Expression } from "plywood";
import { isFunction } from "util";
import { Logger } from "../../../common/logger/logger";
import { DataCube } from "../../../common/models/data-cube/data-cube";
import { Binary } from "../../../common/utils/functional/functional";
import { loadModule } from "../module-loader/module-loader";

export type QueryDecorator = Binary<Expression, Request, Expression>;

export interface QueryDecoratorModule {
  decorator: QueryDecorator;
}

const id = (expression: Expression) => expression;

export function loadQueryDecorator(dataCube: DataCube, anchorPath: string, logger: Logger): QueryDecorator {
  if (!dataCube.queryDecoratorDefinition) return id;
  const path = dataCube.queryDecoratorDefinition.path;
  try {
    logger.log(`Loading query decorator module for ${dataCube.name}`);
    const module = loadModule(path, anchorPath) as QueryDecoratorModule;
    if (!module || !isFunction(module.decorator)) {
      logger.log(`${dataCube.name} query decorator module has no decorator function defined`);
      return id;
    }
    return module.decorator;
  } catch (e) {
    logger.log(`Couldn't load query decorator module for ${dataCube.name} from ${path}`);
    return id;
  }
}
