/// <reference types="Cypress" />

const getCubeCard = (name) => cy.get(`.data-cube-card .title:contains(${name})`);

context("Home Page", () => {
  beforeEach(() => {
    cy.visit("http://localhost:9090");
  });


  it("should load Covid datacube", () => {
    getCubeCard("COVID").should("exist");
  });

  it("should load Wikipedia datacube", () => {
    getCubeCard("Wikipedia").should("exist");
  });

  it("should load Wikipedia cube after clicking tile", () => {
    getCubeCard("Wikipedia").click();
    cy.location("hash").should("match", /wiki/);
  });
});
