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
context("Home Page", () => {
  const getCubeCard = (name: string) => cy.get(`.data-cube-card .title:contains(${name})`);

  beforeEach(() => {
    cy.visit("http://localhost:9090");
  });

  it("should load Covid datacube", () => {
    getCubeCard("COVID").should("exist");
  });

  it("should load Unemployment datacube", () => {
    getCubeCard("Unemployment").should("exist");
  });

  it("should load Wikipedia datacube", () => {
    getCubeCard("Wikipedia").should("exist");
  });

  it("should load Wikipedia cube after clicking tile", () => {
    getCubeCard("Wikipedia").click();
    cy.location("hash").should("match", /wiki/);
  });
});
