/// <reference types="Cypress" />

context("Relative Time Filter Menu", () => {

  // TODO: FIX references
  const filterTile = () => cy.get(".filter-tile .items .filter:first");
  const timeFilter = () => cy.get(".time-filter-menu");
  const tabSelector = () => timeFilter().find(".group-container");
  const filterMenuOkButton = () => timeFilter().find(".button.primary");
  const latestSelector = () => timeFilter().find(".button-group:contains('Latest')");
  const latestPreset = (preset) => latestSelector().find(`.group-member:contains(${preset})`);
  const currentSelector = () => timeFilter().find(".button-group:contains('Current')");
  const currentPreset = (preset) => currentSelector().find(`.group-member:contains(${preset})`);
  const previousSelector = () => timeFilter().find(".button-group:contains('Previous')");
  const previousPreset = (preset) => previousSelector().find(`.group-member:contains(${preset})`);
  const timeShiftSelector = () => timeFilter().find(".button-group:contains('Time shift')");
  const timeShiftPreset = (preset) => timeShiftSelector().find(`.group-member:contains(${preset})`);
  const timeShiftPreview = () => timeFilter().find(".cont .preview:nth-of-type(6)");
  const overlappingError = () => timeFilter().find(".error-message");

  const urls = {
    relativeTimeFilter: "http://localhost:9090/#wiki/"
  };

  beforeEach(() => {
    cy.visit(urls.relativeTimeFilter);
    filterTile().click();
  });

  it("Menu opens after clicking boolean filter tile", () => {
    timeFilter().should("exist");
  });

  it("Menu opens at Fixed tab", () => {
    tabSelector()
      .find(".group-member:contains('Relative')")
      .should("have.class", "selected");
  });

  it("Ok button is disabled at the start", () => {
    filterMenuOkButton().should("be.disabled");
  });

  it("Menu shows selected values", () => {
    latestPreset("1D").should("have.class", "selected");
  });

  it("Selecting different preset should enable Ok button", () => {
    currentPreset("D").click();

    filterMenuOkButton().should("not.be.disabled");
  });

  it("Reselecting same preset should disable Ok button", () => {
    currentPreset("D").click();
    latestPreset("1D").click();

    filterMenuOkButton().should("be.disabled");
  });

  it("Setting time shift shows preview", () => {
    timeShiftPreset("W").click();

    timeShiftPreview().should("contain", "5 Sep 2015 0:01 - 6 Sep 2015 0:01");
  });

  it("Time shift smaller than base period shows overlappng error", () => {
    previousPreset("W").click();
    timeShiftPreset("D").click();

    overlappingError().should("contain", "Shifted period overlaps with main period");
  });

  it("Time shift smaller than base period disables Ok button", () => {
    previousPreset("W").click();
    timeShiftPreset("D").click();

    filterMenuOkButton().should("be.disabled");
  });
});
