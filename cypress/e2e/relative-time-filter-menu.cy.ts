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
context("Relative Time Filter Menu", () => {

  // TODO: FIX references
  const filterTiles = () => cy.get(".center-top-bar:not(.fallback) .filter-tile-row");
  const filterTile = () => filterTiles().get(".items .tile:first");
  const timeFilter = () => cy.get(".time-filter-menu");
  const tabSelector = () => timeFilter().find(".group-container");
  const filterMenuOkButton = () => timeFilter().find(".button.primary");
  const latestSelector = () => timeFilter().find(".button-group:contains('Latest')");
  const latestPreset = (preset: string) => latestSelector().find(`.group-member:contains(${preset})`);
  const latestDayPreset = () => latestPreset("D").first();
  const currentSelector = () => timeFilter().find(".button-group:contains('Current')");
  const currentPreset = (preset: string) => currentSelector().find(`.group-member:contains(${preset})`);
  const previousSelector = () => timeFilter().find(".button-group:contains('Previous')");
  const previousPreset = (preset: string) => previousSelector().find(`.group-member:contains(${preset})`);
  const timeShiftSelector = () => timeFilter().find(".button-group:contains('Time shift')");
  const timeShiftPreset = (preset: string) => timeShiftSelector().find(`.group-member:contains(${preset})`);
  const timeShiftPreview = () => timeFilter().find(".cont .preview:nth-of-type(6)");
  const overlappingError = () => timeFilter().find(".overlap-error-message");

  const urls = {
    relativeTimeFilter: "http://localhost:9090/#wiki/"
  };

  beforeEach(() => {
    cy.visit(urls.relativeTimeFilter);
    filterTile().click();
  });

  describe("Opening menu", () => {
    it("should show menu", () => {
      timeFilter().should("exist");
    });

    it("should select Relative tab", () => {
      tabSelector()
        .find(".group-member:contains('Relative')")
        .should("have.class", "selected");
    });

    it("should have disabled Ok button", () => {
      filterMenuOkButton().should("be.disabled");
    });

    it("should mark selected preset", () => {
      latestDayPreset().should("have.class", "selected");
    });

    it("should mark selected time shift", () => {
      timeShiftPreset("Off").should("have.class", "selected");
    });
  });

  describe("Changing preset", () => {
    it("should enable Ok button after changing preset", () => {
      currentPreset("D").click();

      filterMenuOkButton().should("not.be.disabled");
    });

    it("should disable Ok button after reverting preset", () => {
      currentPreset("D").click();
      latestDayPreset().click();

      filterMenuOkButton().should("be.disabled");
    });
  });

  describe("Changing time shift", () => {
    it("should show preview of previous period after selecting time shift", () => {
      timeShiftPreset("W").click();

      timeShiftPreview().should("contain", "5 Sep 2015 0:01 - 6 Sep 2015 0:01");
    });

    it("should enable Ok button after selecting time shift", () => {
      timeShiftPreset("W").click();

      filterMenuOkButton().should("not.be.disabled");
    });

    it("should disable Ok button after reverting time shift", () => {
      timeShiftPreset("W").click();
      timeShiftPreset("Off").click();

      filterMenuOkButton().should("be.disabled");
    });
  });

  describe("Overlap validation", () => {
    describe("Non overlapping periods", () => {
      beforeEach(() => {
        previousPreset("W").click();
        timeShiftPreset("W").click();
      });

      it("should not show error", () => {
        overlappingError().should("not.exist");
      });

      it("should enable Ok button", () => {
        filterMenuOkButton().should("not.be.disabled");
      });
    });

    describe("Overlapping periods", () => {
      beforeEach(() => {
        previousPreset("W").click();
        timeShiftPreset("D").click();
      });

      it("should show error when periods overlap", () => {
        overlappingError().should("contain", "Shifted period overlaps with main period");
      });

      it("should disable Ok button when periods overlap", () => {
        filterMenuOkButton().should("be.disabled");
      });
    });
  });
});
