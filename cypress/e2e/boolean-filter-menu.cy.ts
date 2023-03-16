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

context("Boolean Filter Menu", () => {

  // TODO: FIX references
  const filterTiles = () => cy.get(".center-top-bar:not(.fallback) .filter-tile-row");
  const booleanTile = () => filterTiles().find(".items .tile:nth-child(2)");
  const booleanMenu = () => cy.get(".boolean-filter-menu");
  const booleanMenuTable = () => booleanMenu().find(".menu-table");
  const falseOption = () => booleanMenuTable().find(".row:contains('false')");
  const trueOption = () => booleanMenuTable().find(".row:contains('true')");
  const booleanMenuOkButton = () => booleanMenu().find(".button.primary");
  const booleanMenuCancelButton = () => booleanMenu().find(".button.secondary");

  const urls = {
    // tslint:disable:max-line-length
    isRobotAllValues: "http://localhost:9090/#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhqZqJQgA0408SqGOAygKZobYDmZe2MCClGALZNkOJvhABRNAGMA9AFUAKgGEKIAGYQEaJgCcuAbVBoAngAdxBIeMp6mGiTfU2ACvqwATI6E8w96Fi4BK4AjAAi6lC65vgAtKECFlYgCOhM0SAAvgC6WeQmyRIARpiYCExwuHYOEtAASpilaOpgiDAZ+IZoeh3kGqRMOZTYxPgDCFBMuZRQ5khoRsMgU3oQnXjGIPYa+kzYMilwnp5MnuoamHqC6PiFlhKnA7wtlG0IHRLZSQ8EwnCwezZZbmCDYbBncIQYTYKBBIwgGQACyqEIQ6mwcGEczgh3UDSaYxBYIhngYVxaBGOp3OWSAA==",
    isRobotOnlyTrueValues: "http://localhost:9090/#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhqZqJQgA0hEAtgKbI634gCiaAxgPQCqAKgMIUQAMwgI0tAE5k8AbVBoAngAcmBDHSGTaw5hqaV9ABSlYAJjPkgzMSeiy4CRgIwARIVAnL8AWmeGVNRAEdFpPEABfAF0I8gVA5gAjTEwEWjhcSm1dAmgAJUxktCEwRBgw/Fk0SXKoymxifGFSWmjKKGUkNEs6kChTCrlQbKlabHYguDMzWjMhYUxJanR8eNVmGeaYcRKyoMiA9YI6OFhtSN7lCGxsWdcaMagHSxB2AAsM24QhbDg6DrgEyE+UKjUu11uZgAyotigQpjM5pQ0gBzMZzPDYbYIShvCAot5IAlwrEIBARIA==="
    // tslint:enable:max-line-length
  };

  function assertSelection(isTrueOptionSelected: boolean, isFalseOptionSelected: boolean) {
    function selectionToPredicate(isSelected: boolean) {
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

  describe("Opening menu", () => {
    it("should show menu", () => {
      booleanMenu().should("exist");
    });

    it("should load possible values", () => {
      booleanMenuTable()
        .find(".row")
        .should("have.length", 2);
    });

    it("should mark selected values", () => {
      assertSelection(true, false);
    });

    it("should have disabled Ok button", () => {
      booleanMenuOkButton().should("be.disabled");
    });
  });

  describe("Closing menu", () => {
    it("should close menu after clicking cancel", () => {
      booleanMenuCancelButton().click();

      booleanMenu().should("not.exist");
    });

    it("should close menu after clicking outside menu", () => {
      cy.get(".visualization-root").click();

      booleanMenu().should("not.exist");
    });

    it("should not change url after closing menu without changes", () => {
      booleanMenuCancelButton().click();

      cy.location("href").should("equal", urls.isRobotOnlyTrueValues);
    });
  });

  describe("Changing selection", () => {
    it("should change selection after clicking option", () => {
      falseOption().click();

      assertSelection(true, true);
    });

    it("should enable Ok button after changing selection", () => {
      falseOption().click();

      booleanMenuOkButton().should("be.not.disabled");
    });

    it("should disable Ok button after reverting to previous selection", () => {
      falseOption().click();
      falseOption().click();

      booleanMenuOkButton().should("be.disabled");
    });

    it("should disable Ok button after selecting empty set", () => {
      trueOption().click();

      booleanMenuOkButton().should("be.disabled");
    });
  });

  describe("Saving selection", () => {
    it("should close menu after saving selection", () => {
      falseOption().click();

      booleanMenuOkButton().click();

      booleanMenu().should("not.exist");
    });

    it("should persist selection change to url", () => {
      falseOption().click();

      booleanMenuOkButton().click();

      cy.location("href").should("equal", urls.isRobotAllValues);
    });

    it("should not change url after canceling selection", () => {
      falseOption().click();

      booleanMenuCancelButton().click();

      cy.location("href").should("equal", urls.isRobotOnlyTrueValues);
    });
  });
});
