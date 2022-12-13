/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2019 Allegro.pl
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

import { Timezone } from "chronoshift";
import { Class, Instance } from "immutable-class";
import { ClientDataCube } from "../data-cube/data-cube";
import { Filter } from "../filter/filter";
import { Splits } from "../splits/splits";

export type LinkGenerator = (dataCube: ClientDataCube, timezone: Timezone, filter: Filter, splits: Splits) => string;

export interface ExternalViewValue {
  title: string;
  linkGenerator: string;
  linkGeneratorFn?: LinkGenerator;
  sameWindow?: boolean;
}

let check: Class<ExternalViewValue, ExternalViewValue>;

export class ExternalView implements Instance<ExternalViewValue, ExternalViewValue> {

  static isExternalView(candidate: any): candidate is ExternalView {
    return candidate instanceof ExternalView;
  }

  static fromJS(parameters: ExternalViewValue): ExternalView {
    const value = parameters;
    return new ExternalView({
      title: value.title,
      linkGenerator: value.linkGenerator,
      linkGeneratorFn: value.linkGeneratorFn,
      sameWindow: value.sameWindow
    });
  }

  public title: string;
  public linkGenerator: string;
  public sameWindow: boolean;
  public linkGeneratorFn: LinkGenerator;

  constructor(parameters: ExternalViewValue) {
    const { title, linkGenerator } = parameters;
    if (!title) throw new Error("External view must have title");
    if (typeof linkGenerator !== "string") throw new Error("Must provide link generator function");

    this.title = title;
    this.linkGenerator = linkGenerator;
    let linkGeneratorFnRaw: any = null;
    try {
      // dataSource is for back compat.
      linkGeneratorFnRaw = new Function("dataCube", "dataSource", "timezone", "filter", "splits", linkGenerator) as LinkGenerator;
    } catch (e) {
      throw new Error(`Error constructing link generator function: ${e.message}`);
    }

    this.linkGeneratorFn = (dataCube: ClientDataCube, timezone: Timezone, filter: Filter, splits: Splits) => {
      try {
        return linkGeneratorFnRaw(dataCube, dataCube, timezone, filter, splits);
      } catch (e) {
        throw new Error(`Error with custom link generating function '${title}': ${e.message} [${linkGenerator}]`);
      }
    };

    this.sameWindow = Boolean(parameters.sameWindow);
  }

  public toJS(): ExternalViewValue {
    const js: ExternalViewValue = {
      title: this.title,
      linkGenerator: this.linkGenerator
    };
    if (this.sameWindow === true) js.sameWindow = true;
    return js;
  }

  public valueOf(): ExternalViewValue {
    const value: ExternalViewValue = {
      title: this.title,
      linkGenerator: this.linkGenerator
    };
    if (this.sameWindow === true) value.sameWindow = true;
    return value;
  }

  public toJSON(): ExternalViewValue {
    return this.toJS();
  }

  public equals(other: ExternalView): boolean {
    return ExternalView.isExternalView(other) &&
      this.title === other.title &&
      this.linkGenerator === other.linkGenerator &&
      this.sameWindow === other.sameWindow;
  }

  public toString(): string {
    return `${this.title}: ${this.linkGenerator}`;
  }
}

check = ExternalView;
