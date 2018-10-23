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

import { expect } from "chai";
import { compose, of, over, set, view } from "./lens";

interface Address {
  street: string;
  zipcode: string;
  number: number;
}

interface Company {
  name: string;
  address: Address;
}

interface Person {
  name: string;
  age: number;
  work: Company;
  address: Address;
}

const StaplesAndSuch: Company = {
  name: "Staples and Such",
  address: {
    street: "Office",
    zipcode: "123-23",
    number: 123
  }
};

const JohnDoe: Person = {
  name: "John Doe",
  age: 40,
  address: {
    street: "Elm",
    zipcode: "404-21",
    number: 12
  },
  work: StaplesAndSuch
};

const personLenses = of<Person>();
const companyLenses = of<Company>();

describe("Lens", () => {
  describe("prop", () => {
    const age = personLenses.prop("age");
    it("view should work", () => {
      expect(view(age)(JohnDoe)).to.be.eq(40);
      expect(view(age, JohnDoe)).to.be.eq(40);
    });
    it("over should work", () => {
      const inc = (i: number) => ++i;
      expect(over(age, inc)(JohnDoe)).to.be.deep.eq({ ...JohnDoe, age: 41 });
      expect(over(age, inc, JohnDoe)).to.be.deep.eq({ ...JohnDoe, age: 41 });
    });
    it("set should work", () => {
      expect(set(age, 42)(JohnDoe)).to.be.deep.eq({ ...JohnDoe, age: 42 });
      expect(set(age, 42, JohnDoe)).to.be.deep.eq({ ...JohnDoe, age: 42 });
    });
  });
  describe("path", () => {
    const companyStreet = personLenses.path("work", "address", "street");
    it("view should work", () => {
      expect(view(companyStreet)(JohnDoe)).to.be.eq("Office");
      expect(view(companyStreet, JohnDoe)).to.be.eq("Office");
    });
    it("over should work", () => {
      const toUpperCase = (str: string) => str.toUpperCase();
      const expected = {
        ...JohnDoe,
        work: {
          ...JohnDoe.work,
          address: {
            ...JohnDoe.work.address,
            street: "OFFICE"
          }
        }
      };
      expect(over(companyStreet, toUpperCase)(JohnDoe)).to.be.deep.eq(expected);
      expect(over(companyStreet, toUpperCase, JohnDoe)).to.be.deep.eq(expected);
    });
    it("set should work", () => {
      const expected = {
        ...JohnDoe,
        work: {
          ...JohnDoe.work,
          address: {
            ...JohnDoe.work.address,
            street: "New Street"
          }
        }
      };
      expect(set(companyStreet, "New Street")(JohnDoe)).to.be.deep.eq(expected);
      expect(set(companyStreet, "New Street", JohnDoe)).to.be.deep.eq(expected);
    });
  });
  describe("pick", () => {
    const ageAndName = personLenses.pick("age", "name");
    it("view should work", () => {
      const expected = { age: 40, name: "John Doe" };
      expect(view(ageAndName)(JohnDoe)).to.be.deep.eq(expected);
      expect(view(ageAndName, JohnDoe)).to.be.deep.eq(expected);
    });
    it("over should work", () => {
      const modifier = ({ age, name }: { age: number, name: string }) =>
        ({ age: age + 2, name: name.toLowerCase() });
      const expected = {
        ...JohnDoe,
        name: "john doe",
        age: 42
      };
      expect(over(ageAndName, modifier)(JohnDoe)).to.be.deep.eq(expected);
      expect(over(ageAndName, modifier, JohnDoe)).to.be.deep.eq(expected);
    });
    it("set should work", () => {
      const update = {
        age: 31,
        name: "Johnny"
      };
      const expected = {
        ...JohnDoe,
        ...update
      };
      expect(set(ageAndName, update)(JohnDoe)).to.be.deep.eq(expected);
      expect(set(ageAndName, update, JohnDoe)).to.be.deep.eq(expected);
    });
  });
  describe("compose", () => {
    describe("prop * prop = path", () => {
      const work = personLenses.prop("work");
      const workName = personLenses.path("work", "name");
      const companyName = companyLenses.prop("name");
      const composed = compose(work, companyName);
      it("set should work", () => {
        expect(set(workName, "bazz", JohnDoe)).to.be.deep.eq(set(composed, "bazz", JohnDoe));
      });
      it("view should work", () => {
        expect(view(workName, JohnDoe)).to.be.deep.eq(view(composed, JohnDoe));
      });
      it("over should work", () => {
        const toUpperCase = (str: string) => str.toUpperCase();
        expect(over(workName, toUpperCase, JohnDoe)).to.be.deep.eq(over(composed, toUpperCase, JohnDoe));
      });
    });
    describe("prop * path = path", () => {
      const work = personLenses.prop("work");
      const workStreet = personLenses.path("work", "address", "street");
      const companyStreet = companyLenses.path("address", "street");
      const composed = compose(work, companyStreet);
      it("set should work", () => {
        expect(set(workStreet, "bazz", JohnDoe)).to.be.deep.eq(set(composed, "bazz", JohnDoe));
      });
      it("view should work", () => {
        expect(view(workStreet, JohnDoe)).to.be.deep.eq(view(composed, JohnDoe));
      });
      it("over should work", () => {
        const toUpperCase = (str: string) => str.toUpperCase();
        expect(over(workStreet, toUpperCase, JohnDoe)).to.be.deep.eq(over(composed, toUpperCase, JohnDoe));
      });
    });
    describe("pick * prop = prop", () => {
      const workAndAge = personLenses.pick("work", "age");
      const age = personLenses.path("age");
      const composed = compose(workAndAge, age);
      it("set should work", () => {
        expect(set(age, 11, JohnDoe)).to.be.deep.eq(set(composed, 11, JohnDoe));
      });
      it("view should work", () => {
        expect(view(age, JohnDoe)).to.be.deep.eq(view(composed, JohnDoe));
      });
      it("over should work", () => {
        const inc = (i: number) => i + 1;
        expect(over(age, inc, JohnDoe)).to.be.deep.eq(over(composed, inc, JohnDoe));
      });
    });
    describe("prop * pick", () => {
      const work = personLenses.path("work");
      const nameAndAddress = companyLenses.pick("name", "address");
      const composed = compose(work, nameAndAddress);
      it("over should work", () => {
        const expected = {
          ...JohnDoe,
          work: {
            ...JohnDoe.work,
            name: JohnDoe.work.name.toLowerCase()
          }
        };
        const modify = ({ name, address }: { name: string, address: Address }) =>
          ({ name: name.toLowerCase(), address });
        expect(over(composed, modify, JohnDoe)).to.be.deep.eq(expected);
      });
      it("view should work", () => {
        const expected = {
          address: JohnDoe.work.address,
          name: JohnDoe.work.name
        };
        expect(view(composed, JohnDoe)).to.be.deep.eq(expected);
      });
      it("set should work", () => {
        const update = { name: "NewName", address: { street: "bazz", number: 11, zipcode: "abc" } };
        const expected = {
          ...JohnDoe,
          work: {
            ...JohnDoe.work,
            ...update
          }
        };
        expect(set(composed, update, JohnDoe)).to.be.deep.eq(expected);
      });
    });
  });
});
