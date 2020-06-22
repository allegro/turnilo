/// <reference types="Cypress" />

context("Bar Chart", () => {

  const barChart = () => cy.get(".bar-chart");
  const xAxis = () => cy.get(".bar-chart-x-axis");
  const ticks = () => xAxis().find("g");

  const urls = {
    timeSplit: "http://localhost:9090/#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwgBGcATgLQDGAFqWiADTjTxKoY4DKApmhtgOZR82GAgSMMAWy7IcXfCACiaCgHoAqgBUAwgxAAzCAjRcSQvAG1QaAJ4AHeQSnzGJLvoXO9zgAqmsACbmViABMCToWLgEPgCMACJ6UCZ2+GSxEvaOIAjoXMkgAL4AuiWMUHZIaMHWWZ4Q0noBDVzYUFH1jYz8ESK5JBC2Cj6asQASSZgkdHigbh5OLd51BM3SbR2MzW4U7NEgcFAUrc0CRYxIkoPCoghlIFD++fgh86atxwpwAQFcAXr6KaSdD4WoOBS/fRwUR0RhgRAwbLnEC2cEEaSHcLye52CDYbB/eItDY4YIgahwfFcBB6bBwaQVOCfRjQABKmEImDoxUYuKpAQ4UxmBx+fyKQA",
  };

  describe("Time split", () => {
    beforeEach(() => {
      cy.visit(urls.timeSplit);
    });

    it("should load bar-chart", () => {
      barChart().should("exist");
    });

    it("should load three ticks", () => {
      ticks().should("have.length", 3);
    });
  });
});
