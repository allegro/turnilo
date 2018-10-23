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
import { Record } from "immutable";
import { compose, over, set, view } from "./lens";
import { of } from "./record-lens";

interface Address {
  street: string;
  zipcode: string;
  number: number;
}

const defaultAddress: Address = {
  street: "foobar",
  zipcode: "1234",
  number: 0
};

class RAddress extends Record<Address>(defaultAddress) {
}

interface Company {
  name: string;
  address: Address;
}

const defaultCompany: Company = {
  name: "foobar",
  address: new RAddress({ street: "bazz" })
};

class RCompany extends Record<Company>(defaultCompany) {
}

interface Person {
  name: string;
  age: number;
  work: Company;
  address: Address;
}

const defaultPerson: Person = {
  name: "johnny",
  age: 101,
  work: new RCompany({ name: "johnny's shack" }),
  address: new RAddress({ street: "highway" })
};

class RPerson extends Record<Person>(defaultPerson) {
}

const personLenses = of<Person>();

const JohnDoe = new RPerson({
  name: "John Doe",
  age: 40,
  work: new RCompany({
    address: new RAddress({
      street: "Office",
      zipcode: "123-23",
      number: 123
    }),
    name: "Staples and Such"
  }),
  address: new RAddress({
    street: "Elm",
    zipcode: "404-21",
    number: 12
  })
});

describe("Record lens", () => {
  describe("prop", () => {
    const age = personLenses.prop("age");
    it("view should work", () => {
      expect(view(age)(JohnDoe)).to.be.eq(40);
      expect(view(age, JohnDoe)).to.be.eq(40);
    });
    it("over should work", () => {
      const inc = (i: number) => ++i;
      expect(over(age, inc)(JohnDoe).equals(JohnDoe.update("age", inc))).to.be.true;
      expect(over(age, inc, JohnDoe).equals(JohnDoe.update("age", inc))).to.be.true;
    });
    it("set should work", () => {
      expect(set(age, 42)(JohnDoe).equals(JohnDoe.set("age", 42))).to.be.true;
      expect(set(age, 42, JohnDoe).equals(JohnDoe.set("age", 42))).to.be.true;
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
      const expected = JohnDoe.updateIn(["work", "address", "street"], toUpperCase);
      expect(over(companyStreet, toUpperCase)(JohnDoe).equals(expected)).to.be.true;
      expect(over(companyStreet, toUpperCase, JohnDoe).equals(expected)).to.be.true;
    });
    it("set should work", () => {
      const expected = JohnDoe.setIn(["work", "address", "street"], "New Street");
      expect(set(companyStreet, "New Street")(JohnDoe).equals(expected)).to.be.true;
      expect(set(companyStreet, "New Street", JohnDoe).equals(expected)).to.be.true;
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
      const expected = JohnDoe.update("age", age => age + 2).update("name", name => name.toLowerCase());
      expect(over(ageAndName, modifier)(JohnDoe).equals(expected)).to.be.true;
      expect(over(ageAndName, modifier, JohnDoe).equals(expected)).to.be.true;
    });
    it("set should work", () => {
      const update = {
        age: 31,
        name: "Johnny"
      };
      const expected = JohnDoe.set("age", 31).set("name", "Johnny");
      expect(set(ageAndName, update)(JohnDoe).equals(expected)).to.be.true;
      expect(set(ageAndName, update, JohnDoe).equals(expected)).to.be.true;
    });
  });
});
