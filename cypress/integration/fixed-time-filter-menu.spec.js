/// <reference types="Cypress" />

context("Fixed Time Filter Menu", () => {

  // TODO: FIX references
  const filterTile = () => cy.get(".filter-tile .items .filter:first");
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
  const calendarDay = (day) => calendar().find(`.day.value:contains(${day})`);
  const timeShiftSelector = () => timeFilter().find(".cont");
  const timeShiftPreset = (preset) => timeShiftSelector().find(`.button-group .group-member:contains(${preset})`);
  const timeShiftCustom = () => timeShiftSelector().find(".custom-input");
  const timeShiftPreview = () => timeShiftSelector().find(".preview");
  const overlappingError = () => timeShiftSelector().find(".error-message");

  const urls = {
    fixedTimeFilter: "http://localhost:9090/#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhqZqJQgA0hEAtgKbI634gCiaAxgPQCqAKgMIUQAMwgI0tAE5k8AbVBoAngAcmBDHSGTaw5hqaV9AJTjYA5rRnyQUEpLTMATAAYAjAFYAtM4Ccn1468zs54bqHOAHTBzgBaQrTYACZObl6+/gDMQSFhwVHBcQC+ALollFDKSGhWxeVSEJb41trCUgnsaiBwiYm0yZTCmJLU6PgKKp29wnAw4kJgiDCdIIWGE8x0cLDaK7UgyhDY2H0AIjQJUFjYViDsABamxwhC2HB0FXAdQtBGmABGxBAewORz6AGUhg4CN1ev0QAhaBYkvhsLMEJQ7hAzHckNioaiEAhCkA=="
  };

  function assertInputValues(startDate, startTime, endDate, endTime) {
    startDateInput().should("have.value", startDate);
    startTimeInput().should("have.value", startTime);
    endDateInput().should("have.value", endDate);
    endTimeInput().should("have.value", endTime);
  }

  function assertCalendarValues(date, startDay, endDay) {
    calendarHeader().should("contain", date);
    calendarDay(startDay).should("have.class", "selected");
    calendarDay(endDay).should("have.class", "selected");
  }

  function assertTimeShiftPreset(preset) {
    timeShiftPreset(preset).should("have.class", "selected");
  }

  function assertTimeShiftCustomValue(value) {
    timeShiftPreset("…").should("have.class", "selected");
    timeShiftCustom().should("have.value", value);
  }

  beforeEach(() => {
    cy.visit(urls.fixedTimeFilter);
    filterTile().click();
  });

  it("Menu opens after clicking boolean filter tile", () => {
    timeFilter().should("exist");
  });

  it("Menu opens at Fixed tab", () => {
    tabSelector()
      .find(".group-member:contains('Fixed')")
      .should("have.class", "selected");
  });

  it("Ok button is disabled at the start", () => {
    filterMenuOkButton().should("be.disabled");
  });

  it("Menu shows selected values in inputs", () => {
    assertInputValues("2015-09-12", "00:01", "2015-09-13", "00:01");
  });

  it("Menu shows selected values on calendar", () => {
    assertCalendarValues("September 2015", 12, 13);
  });

  it("Menu shows selected time shift", () => {
    assertTimeShiftPreset("Off");
  });

  it("Changing selection enables Ok button", () => {
    startDateInput().clear().type("2015-09-11");

    filterMenuOkButton().should("not.be.disabled");
  });

  it("Changing selection to same value keeps Ok button disabled", () => {
    startDateInput().clear().type("2015-09-12");

    filterMenuOkButton().should("be.disabled");
  });

  it("Clicking on calendar changes selection", () => {
    calendarDay(10).click();
    calendarDay(14).click();

    assertCalendarValues("September 2015", 10, 14);
  });

  it("Clicking on calendar changes selection", () => {
    calendarDay(10).click();
    calendarDay(14).click();

    assertInputValues("2015-09-10", "00:00", "2015-09-15", "00:00");
  });

  it("Changing selection with calendar enables Ok button", () => {
    calendarDay(10).click();
    calendarDay(14).click();

    filterMenuOkButton().should("not.be.disabled");
  });

  it("Changing time shift shows preview", () => {
    timeShiftPreset("W").click();

    timeShiftPreview().should("contain", "5 Sep 2015 0:01 - 6 Sep 2015 0:01");
  });

  it("Changing time shift enables Ok button", () => {
    timeShiftPreset("W").click();

    filterMenuOkButton().should("not.be.disabled");
  });

  it("Changing to short time shift shows error about overlapping periods", () => {
    timeShiftPreset("D").click();

    overlappingError()
      .should("exist")
      .should("contain", "Shifted period overlaps with main period");
  });

  it("Overlapping error disables Ok button", () => {
    timeShiftPreset("D").click();

    filterMenuOkButton().should("be.disabled");
  });

  it("Selecting to big period shows error about overlapping periods", () => {
    timeShiftPreset("W").click();

    calendarDay(10).click();
    calendarDay(28).click();

    overlappingError()
      .should("exist")
      .should("contain", "Shifted period overlaps with main period");
  });
});
