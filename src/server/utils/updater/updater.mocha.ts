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

const { expect } = require("chai");
import { updater } from "./updater";

function valueEqual(a: any, b: any) {
  return a.value === b.value;
}

describe("updater", function() {
  it("one enter", () => {
    const ops: string[] = [];

    updater(
      [],
      [{ name: "A" }],
      {
        equals: valueEqual,
        onEnter: newThing => {
          ops.push(`Enter ${newThing.name}`);
        },
        onUpdate: (newThing, oldThing) => {
          ops.push(`Update ${oldThing.name} ${oldThing.value} => ${newThing.value}`);
        },
        onExit: oldThing => {
          ops.push(`Exit ${oldThing.name}`);
        }
      }
    );

    expect(ops.join("; ")).to.equal("Enter A");
  });

  it("one exit", () => {
    const ops: string[] = [];

    updater(
      [{ name: "A" }],
      [],
      {
        equals: valueEqual,
        onEnter: newThing => {
          ops.push(`Enter ${newThing.name}`);
        },
        onUpdate: (newThing, oldThing) => {
          ops.push(`Update ${oldThing.name} ${oldThing.value} => ${newThing.value}`);
        },
        onExit: oldThing => {
          ops.push(`Exit ${oldThing.name}`);
        }
      }
    );

    expect(ops.join("; ")).to.equal("Exit A");
  });

  it("enter / exit", () => {
    const ops: string[] = [];

    updater(
      [{ name: "A" }],
      [{ name: "B" }],
      {
        equals: valueEqual,
        onEnter: newThing => {
          ops.push(`Enter ${newThing.name}`);
        },
        onUpdate: (newThing, oldThing) => {
          ops.push(`Update ${oldThing.name} ${oldThing.value} => ${newThing.value}`);
        },
        onExit: oldThing => {
          ops.push(`Exit ${oldThing.name}`);
        }
      }
    );

    expect(ops.join("; ")).to.equal("Enter B; Exit A");
  });

  it("enter / update / exit", () => {
    const ops: string[] = [];

    updater(
      [{ name: "A", value: 1 }, { name: "B", value: 2 }],
      [{ name: "B", value: 3 }, { name: "C", value: 4 }],
      {
        equals: valueEqual,
        onEnter: newThing => {
          ops.push(`Enter ${newThing.name}`);
        },
        onUpdate: (newThing, oldThing) => {
          ops.push(`Update ${oldThing.name} ${oldThing.value} => ${newThing.value}`);
        },
        onExit: oldThing => {
          ops.push(`Exit ${oldThing.name}`);
        }
      }
    );

    expect(ops.join("; ")).to.equal("Update B 2 => 3; Enter C; Exit A");
  });

});
