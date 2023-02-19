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
import * as plywood from "plywood";
import { isFunction } from "util";
import { DataCube } from "../../../common/models/data-cube/data-cube";
import { QueryDecoratorOptions } from "../../../common/models/query-decorator/query-decorator";
import { Binary, identity, Quaternary, Unary } from "../../../common/utils/functional/functional";
import { loadModule } from "../module-loader/module-loader";
import { SettingsManager } from "../settings-manager/settings-manager";

type Expression = plywood.Expression;

type RawQueryDecorator = Binary<Expression, Request, Expression>;

type QueryDecoratorWithOptions = Quaternary<Expression, Request, QueryDecoratorOptions, typeof plywood, Expression>;

export interface QueryDecoratorModule {
  decorator: RawQueryDecorator;
}

type Settings = Pick<SettingsManager, "logger" | "anchorPath">;

function loadQueryDecorator(dataCube: DataCube, { anchorPath, logger }: Settings): RawQueryDecorator {
  const definition = dataCube.queryDecorator;
  if (!definition) return identity;
  try {
    logger.log(`Loading query decorator module for ${dataCube.name}`);
    const module = loadModule(definition.path, anchorPath) as QueryDecoratorModule;
    if (!module || !isFunction(module.decorator)) {
      logger.warn(`${dataCube.name} query decorator module has no decorator function defined`);
      return identity;
    }
    const decorator = module.decorator as QueryDecoratorWithOptions;
    return (e: Expression, req: Request) => decorator(e, req, definition.options, plywood);
  } catch (e) {
    logger.warn(`Couldn't load query decorator for ${dataCube.name}. ${e.message}`);
    return identity;
  }
}

export type AppliedQueryDecorator = Unary<Expression, Expression>;

// TODO: Can we cache somewhere these decorators? Inside SettingsManager perhaps?
export function getQueryDecorator(req: Request, dataCube: DataCube, settings: Settings): AppliedQueryDecorator {
  const decorator = loadQueryDecorator(dataCube, settings);
  return (e: Expression) => decorator(e, req);
}
