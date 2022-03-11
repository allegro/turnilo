/*
 * Copyright 2017-2022 Allegro.pl
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
context("Totals", () => {
  beforeEach(() => {
    cy.visit("http://localhost:9090/#wiki");
  });

  it("should load Totals visualisation", () => {
    cy.get(".visualization-root")
      .should("have.class", "totals");
  });

  it("should set Latest day time filter", () => {
    cy.get(".filter-tile .filter")
      .should("have.length", 1)
      .should("contain", "Latest day");
  });

  it('should set default series "Added"', () => {
    cy.get(".series-tile .series")
      .should("have.length", 1)
      .should("contain", "Added");
  });

  it("should load data for defined filters and measures", () => {
    cy.get(".visualization .total .measure-name")
      .should("have.length", 1)
      .should("contain", "Added");

    cy.get(".visualization .total .measure-value")
      .should("have.length", 1)
      .should("contain", "9.4 m");
  });
});
