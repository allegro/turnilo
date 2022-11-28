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
context("Pinboard", () => {

  const pinboardPanel = () => cy.get(".pinboard-panel");
  const pinboardMeasureTile = () => pinboardPanel().find(".pinboard-measure-tile");
  const pinboardSort = () => pinboardMeasureTile().find(".dropdown");
  const pinboardSortError = () => pinboardMeasureTile().find(".pinboard-sort-error");
  const pinboardSortSelected = () => pinboardSort().find(".selected-item");
  const pinboardTiles = () => pinboardPanel().find(".pinboard-tile");
  const seriesTiles = () => cy.get(".center-top-bar:not(.fallback) .series-tile-row");
  const measureTile = (title: string) => seriesTiles().find(`.tile.measure:contains(${title})`);

  describe("Pinboard", () => {
    const urls = {
      wiki: "http://localhost:9090/#wiki"
    };

    beforeEach(() => {
      cy.visit(urls.wiki);
    });

    it("should show pinboard", () => {
      pinboardPanel().should("exist");
    });

    it("should show three pinboard tiles", () => {
      pinboardTiles().should("have.length", 3);
    });

    describe("Pinboard Sort", () => {
      it("should show pinboard sort selector", () => {
        pinboardSort().should("exist");
      });

      it("should select Added as pinboard sort", () => {
        pinboardSortSelected().should("contain", "Added");
      });

      describe("After removing last measure", () => {
        beforeEach(() => {
          measureTile("Added").find(".remove").click();
        });

        it("should show error", () => {
          pinboardSortError().should("contain", "No measure selected");
        });

        it("should hide pinboard tiles", () => {
          pinboardTiles().should("have.length", 0);
        });
      });
    });
  });
});
