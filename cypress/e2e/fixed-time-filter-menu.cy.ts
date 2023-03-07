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
context("Fixed Time Filter Menu", () => {

  // TODO: FIX references
  const filterTiles = () => cy.get(".center-top-bar:not(.fallback) .filter-tile-row");
  const filterTile = () => filterTiles().get(".items .tile:first");
  const timeFilter = () => cy.get(".time-filter-menu");
  const tabSelector = () => timeFilter().find(".group-container");
  const datePicker = () => timeFilter().find(".date-range-picker");
  const filterMenuOkButton = () => timeFilter().find(".button.primary");
  const startDateInput = () => datePicker().find(".date-range-input:first input:first");
  const startTimeInput = () => datePicker().find(".date-range-input:first input:nth-of-type(2)");
  const endDateInput = () => datePicker().find(".date-range-input:nth-of-type(2) input:first");
  const endTimeInput = () => datePicker().find(".date-range-input:nth-of-type(2) input:nth-of-type(2)");
  const calendar = () => datePicker().find(".calendar");
  const calendarHeader = () => calendar().find(".calendar-nav");
  const calendarDay = (day: number) => calendar().find(`.day.value:contains(${day})`);
  const timeShiftSelector = () => timeFilter().find(".cont");
  const timeShiftPreset = (preset: string) => timeShiftSelector().find(`.button-group .group-member:contains(${preset})`);
  const timeShiftPreview = () => timeShiftSelector().find(".preview");
  const overlappingError = () => timeShiftSelector().find(".overlap-error-message");

  const urls = {
    // tslint:disable-next-line:max-line-length
    fixedTimeFilter: "http://localhost:9090/#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhqZqJQgA0hEAtgKbI634gCiaAxgPQCqAKgMIUQAMwgI0tAE5k8AbVBoAngAcmBDHSGTaw5hqaV9AJTjYA5rRnyQUEpLTMATAAYAjAFYAtM4Ccn1468zs54bqHOAHTBzgBaQrTYACZObl6+/gDMQSFhwVHBcQC+ALollFDKSGhWxeVSEJb41trCUgnsaiBwiYm0yZTCmJLU6PgKKp29wnAw4kJgiDCdIIWGE8x0cLDaK7UgyhDY2H0AIjQJUFjYViDsABamxwhC2HB0FXAdQtBGmABGxBAewORz6AGUhg4CN1ev0QAhaBYkvhsLMEJQ7hAzHckNioaiEAhCkA=="
  };

  function assertInputValues(startDate: string, startTime: string, endDate: string, endTime: string) {
    startDateInput().should("have.value", startDate);
    startTimeInput().should("have.value", startTime);
    endDateInput().should("have.value", endDate);
    endTimeInput().should("have.value", endTime);
  }

  function assertCalendarValues(date: string, startDay: number, endDay: number) {
    calendarHeader().should("contain", date);
    calendarDay(startDay).should("have.class", "selected");
    calendarDay(endDay).should("have.class", "selected");
  }

  beforeEach(() => {
    cy.visit(urls.fixedTimeFilter);
    filterTile().click();
  });

  describe("Opening menu", () => {
    it("should show menu", () => {
      timeFilter().should("exist");
    });

    it("should select Fixed tab", () => {
      tabSelector()
        .find(".group-member:contains('Fixed')")
        .should("have.class", "selected");
    });

    it("should have disabled Ok button", () => {
      filterMenuOkButton().should("be.disabled");
    });

    it("should load selected dates into inputs", () => {
      assertInputValues("2015-09-12", "00:01", "2015-09-13", "00:01");
    });

    it("should mark selected days on calendar", () => {
      assertCalendarValues("September 2015", 12, 13);
    });

    it("should mark selected time shift", () => {
      timeShiftPreset("Off").should("have.class", "selected");
    });
  });

  describe("Changing values", () => {
    it("should enable Ok button after changing date", () => {
      startDateInput().clear().type("2015-09-11");

      filterMenuOkButton().should("not.be.disabled");
    });

    it("should disable Ok button after reverting date", () => {
      startDateInput().clear().type("2015-09-12");

      filterMenuOkButton().should("be.disabled");
    });

    it("should reflect calendar changes after changing range", () => {
      calendarDay(10).click();
      calendarDay(14).click();

      assertCalendarValues("September 2015", 10, 14);
    });

    it("should populate date inputs after changing range on calendar", () => {
      calendarDay(10).click();
      calendarDay(14).click();

      assertInputValues("2015-09-10", "00:00", "2015-09-15", "00:00");
    });

    it("should enable Ok button after changing range on calendar", () => {
      calendarDay(10).click();
      calendarDay(14).click();

      filterMenuOkButton().should("not.be.disabled");
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
        timeShiftPreset("W").click();

        calendarDay(10).click();
        calendarDay(16).click();
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
        timeShiftPreset("W").click();

        calendarDay(10).click();
        calendarDay(17).click();
      });

      it("should show error", () => {
        overlappingError()
          .should("exist")
          .should("contain", "Shifted period overlaps with main period");
      });

      it("should disable Ok button", () => {
        filterMenuOkButton().should("be.disabled");
      });
    });
  });
});
