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

  const topBar = () => cy.get(".center-top-bar:not(.fallback)");
  const filters = () => topBar().find(".filter-tile-row .tile");
  const series = () => topBar().find(".series-tile-row .tile");
  const visualization = () => cy.get(".visualization-root");

  beforeEach(() => {
    cy.visit("http://localhost:9090/#wiki");
  });

  it("should load Totals visualisation", () => {
    visualization()
      .should("have.class", "totals");
  });

  it("should set Latest day time filter", () => {
    filters()
      .should("have.length", 1)
      .should("contain", "Latest day");
  });

  it('should set default series "Added"', () => {
    series()
      .should("have.length", 1)
      .should("contain", "Added");
  });

  it("should load data for defined filters and measures", () => {
    visualization().find(".measure-name")
      .should("have.length", 1)
      .should("contain", "Added");

    visualization().find(".measure-value")
      .should("have.length", 1)
      .should("contain", "9.4 m");
  });
});
