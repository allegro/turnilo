/// <reference types="Cypress" />

context("Boolean Filter Menu", () => {

  // TODO: FIX reference
  const booleanTile = () => cy.get(".filter-tile .items .filter:nth-child(2)");
  const booleanMenu = () => cy.get(".boolean-filter-menu");
  const booleanMenuTable = () => booleanMenu().find(".menu-table");
  const falseOption = () => booleanMenuTable().find(".row:contains('false')");
  const trueOption = () => booleanMenuTable().find(".row:contains('true')");
  const booleanMenuOkButton = () => booleanMenu().find(".button.primary");
  const booleanMenuCancelButton = () => booleanMenu().find(".button.secondary");

  const urls = {
    // tslint:disable-next-line:max-line-length
    isRobotAllValues: "http://localhost:9090/#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhqZqJQgA0hEAtgKbI634gCiaAxgPQCqAKgMIUQAMwgI0tAE5k8AbVBoAngAcmBDHSGTaw5hqaV9ABSlYAJjPkgzMSeiy4CRgIwARIVAnL8AWmeGVNRAEdFpPEABfAF0I8gVA5gAjTEwEWjhcSm1dAmgAJUxktCEwRBgw/Fk0SXLyYVJaKMpsYnx6hChaaMooZSQ0SyaQTskICrlQbKlabHYguDMzWjMhYUxJanR8eNVmJfqYcRKyoMiA3YI6OFhtSKHlCGxsZdcaGagHSxB2AAsM54QQmwcDovTgcyE+UKrXuj2eZgAyutigQFksVpQ0gBzGYrPDYQ4ISg/CBYn5IMkogkIBARIA==",
    // tslint:disable-next-line:max-line-length
    isRobotOnlyTrueValues: "http://localhost:9090/#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhqZqJQgA0hEAtgKbI634gCiaAxgPQCqAKgMIUQAMwgI0tAE5k8AbVBoAngAcmBDHSGTaw5hqaV9ABSlYAJjPkgzMSeiy4CRgIwARIVAnL8AWmeGVNRAEdFpPEABfAF0I8gVA5gAjTEwEWjhcSm1dAmgAJUxktCEwRBgw/Fk0SXKoymxifGFSWmjKKGUkNEs6kChTCrlQbKlabHYguDMzWjMhYUxJanR8eNVmGeaYcRKyoMiA9YI6OFhtSN7lCGxsWdcaMagHSxB2AAsM24QhbDg6DrgEyE+UKjUu11uZgAyotigQpjM5pQ0gBzMZzPDYbYIShvCAot5IAlwrEIBARIA==="
  };

  function assertSelection(isTrueOptionSelected, isFalseOptionSelected) {
    function selectionToPredicate(isSelected) {
      return isSelected ? "have.class" : "not.have.class";
    }

    booleanMenuTable()
      .within(() => {
        cy.get(".row:contains('true') .checkbox")
          .should(selectionToPredicate(isTrueOptionSelected), "selected");
        cy.get(".row:contains('false') .checkbox")
          .should(selectionToPredicate(isFalseOptionSelected), "selected");
      });
  }

  beforeEach(() => {
    cy.visit(urls.isRobotOnlyTrueValues);
    booleanTile().click();
  });

  it("Menu opens after clicking boolean filter tile", () => {
    booleanMenu().should("exist");
  });

  it("Menu loads values", () => {
    booleanMenuTable()
      .find(".row")
      .should("have.length", 2);
  });

  it("Menu show selected values", () => {
    assertSelection(true, false);
  });

  it("Ok button is disabled at the start", () => {
    booleanMenuOkButton().should("be.disabled");
  });

  it("Clicking Cancel should close menu", () => {
    booleanMenuCancelButton().click();

    booleanMenu().should("not.exist");
  });

  it("Clicking Cancel should not change url", () => {
    booleanMenuCancelButton().click();

    cy.location("href").should("equal", urls.isRobotOnlyTrueValues);
  });

  it("Clicking Cancel should not change url even after changes to selection", () => {
    falseOption().click();
    booleanMenuCancelButton().click();

    cy.location("href").should("equal", urls.isRobotOnlyTrueValues);
  });

  it("Clicking outside menu should close menu", () => {
    cy.get(".base-visualization").click();

    booleanMenu().should("not.exist");
  });

  it("Clicking row should change selection", () => {
    falseOption().click();

    assertSelection(true, true);
  });

  it("Changing selection should enable Ok button", () => {
    falseOption().click();

    booleanMenuOkButton().should("be.not.disabled");
  });

  it("Different selection after clicking Ok should close menu", () => {
    falseOption().click();

    booleanMenuOkButton().click();

    booleanMenu().should("not.exist");
  });

  it("Different selection after clicking Ok should save changes in url", () => {
    falseOption().click();

    booleanMenuOkButton().click();

    cy.location("href").should("equal", urls.isRobotAllValues);
  });

  it("Reverting selection should disable Ok button", () => {
    falseOption().click();
    falseOption().click();

    booleanMenuOkButton().should("be.disabled");
  });

  it("Empty selection should disable Ok button", () => {
    trueOption().click();

    booleanMenuOkButton().should("be.disabled");
  });
});
