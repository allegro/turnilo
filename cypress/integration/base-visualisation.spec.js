/// <reference types="Cypress" />

context("Base Visualisation", () => {
  beforeEach(() => {
    cy.visit("http://localhost:9090/#wiki")
  });

  it("should load Totals visualisation", () => {
    cy.get(".base-visualization")
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
