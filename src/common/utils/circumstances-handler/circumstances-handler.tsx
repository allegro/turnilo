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

import { Dimension, Essence, Splits, SplitCombine, Filter, FilterClause, Measure, DataCube, Colors } from '../../models/index';
import { Resolve, Resolution } from '../../models/manifest/manifest';

export type Configuration = (splits: Splits, dataCube?: DataCube) => boolean;
export type Action = (splits?: Splits, dataCube?: DataCube, colors?: Colors, current?: boolean) => Resolve;

export class CircumstancesHandler {
  public static noSplits() {
    return (splits: Splits) => splits.length() === 0;
  }

  private static testKind(kind: string, selector: string): boolean {
    if (selector === '*') {
      return true;
    }

    var bareSelector = selector.replace(/^!/, '');

    // This can be enriched later, right now it's just a 1-1 match
    var result = kind === bareSelector;

    if (selector.charAt(0) === '!') {
      return !result;
    }

    return result;
  }


  public static strictCompare(selectors: string[], kinds: string[]): boolean {
    if (selectors.length !== kinds.length) return false;

    return selectors.every((selector, i) => CircumstancesHandler.testKind(kinds[i], selector));
  }

  public static areExactSplitKinds = (...selectors: string[]) => {
    return (splits: Splits, dataCube: DataCube): boolean => {
      var kinds: string[] = splits.toArray().map((split: SplitCombine) => split.getDimension(dataCube.dimensions).kind);
      return CircumstancesHandler.strictCompare(selectors, kinds);
    };
  };

  public static haveAtLeastSplitKinds = (...kinds: string[]) => {
    return (splits: Splits, dataCube: DataCube): boolean => {
      let getKind = (split: SplitCombine) => split.getDimension(dataCube.dimensions).kind;

      let actualKinds = splits.toArray().map(getKind);

      return kinds.every((kind) => actualKinds.indexOf(kind) > -1);
    };
  };

  public static EMPTY() {
    return new CircumstancesHandler();
  }

  private configurations: Configuration[][];
  private actions: Action[];

  private otherwiseAction: Action;

  constructor() {
    this.configurations = [];
    this.actions = [];
  }

  public when(configuration: Configuration): any {
    let temp: Configuration[] = [configuration];

    let ret = {
      or: (conf: Configuration) => {
        temp.push(conf);
        return ret;
      },
      then: (action: Action) => {
        this.configurations.push(temp);
        this.actions.push(action);
        return this;
      }
    };

    return ret;
  }


  public otherwise(action: Action): CircumstancesHandler {
    this.otherwiseAction = action;

    return this;
  }

  public needsAtLeastOneSplit(message?: string): CircumstancesHandler {
    return this
      .when(CircumstancesHandler.noSplits())
      .then((splits: Splits, dataCube: DataCube) => {
        var someDimensions = dataCube.dimensions.toArray().filter(d => d.kind === 'string').slice(0, 2);
        return Resolve.manual(4, message,
          someDimensions.map((someDimension) => {
            return {
              description: `Add a split on ${someDimension.title}`,
              adjustment: {
                splits: Splits.fromSplitCombine(SplitCombine.fromExpression(someDimension.expression))
              }
            };
          })
        );
      }
    );
  }

  public evaluate(dataCube: DataCube, splits: Splits, colors: Colors, current: boolean): Resolve {
    for (let i = 0; i < this.configurations.length; i++) {
      let confs = this.configurations[i];

      if (confs.some((c) => c(splits, dataCube))) {
        return this.actions[i](splits, dataCube, colors, current);
      }
    }

    return this.otherwiseAction(splits, dataCube, colors, current);
  }
}
