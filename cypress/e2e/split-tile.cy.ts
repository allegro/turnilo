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
context("Split Tile", () => {

  const splitsContainer = () => cy.get(".center-top-bar:not(.fallback) .split-tile-row");
  const dragMask = () => cy.get(".drag-mask");
  const splitTile = (dimension: string) => splitsContainer().find(`.tile.dimension:contains(${dimension})`);
  const addSplitButton = () => splitsContainer().find(".add-tile");
  const splitItemsRow = () => splitsContainer().find(".items");
  const splitItems = () => splitsContainer().find(".items .tile.dimension");
  const splitOverflow = () => splitsContainer().find(".items .overflow.dimension");
  const splitOverflowMenu = () => cy.get(".overflow-menu");
  const addSplitMenu = () => cy.get(".add-tile-menu");
  const splitMenu = () => cy.get(".split-menu");
  const dimensionsList = () => cy.get(".dimension-list-tile");
  const dimensionTile = (dimension: string) => cy.get(`.dimension-list-tile .dimension:contains(${dimension})`);
  const dimensionAddSplitAction = () => cy.get(".dimension-actions-menu .subsplit.action");
  const dimensionReplaceSplitAction = () => cy.get(".dimension-actions-menu .split.action");

  const urls = {
    // tslint:disable:max-line-length
    allSplitTypes: "http://localhost:9090/#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhpwBGCApiADSEQC2ZyOFBAomgMYD0AqgCoDCVEADMICNGQBOUfAG1QaAJ4AHZjXpDJZYfnUVqGegAUpWACYy88kGZiT0WXASMBGACJCoE5fgC0LgxU1BHQyLxAAXwBdaOooZSQ0S2slVV0vSQhsAHMhMzoybChHXWU4bP0QKExJNHxQLR0CODMzMjMhVLUoUzC8iC12DBxdNqh2QvycoVVMzA6CSOokWgg6vABWCMoFIN1DSvz6IpKCA6Fs+2wYEMylXSNeFwAJTxr1hu19gs69giPCsURtR8oNhk4QHBxpMsrltiAVmt8NcEAhtrs0gRrrRiFJ+scgRD2JhaMc0AAZQrZNAACwuVxucDuinwLgADHF3vUQI1dC02h1Apiqr0ZCCBmQhqcbGEJtgprlqLNzLolgi6EjNrERZk+lZPsIpIUJnzWu0hMIarR0NyuqNtHAbnVqGBEDA1Gq7QR6FC7BRtcosth2m4CiccMkQOwaXBsMGEEJsHB6PE4CbqNAAEqYYiYOpRJVB9oAZS5zTNgoRZAq8uRNwQ1BpEGyNKQLfWKLRQA",
    channelSplit: "http://localhost:9090/#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhpwBGCApiADSEQC2ZyOFBAomgMYD0AqgCoDCVEADMICNGQBOUfAG1QaAJ4AHZjXpDJZYfnUVqGegAUpWACYy88kGZiT0WXASMBGACJCoE5fgC0LgxU1BHQyLxAAXwBdaOooZSQ0S2slVV0vSQhsAHMhMzoybChHXXYACzhsbDIET0xJNHxQLR0CODMzMjMhVLUoUzC8iC12DBxdTqh2QvycoVVMzG6CSOokWghGvABWAAZYkH7Mwatm7SlC6d12zu7qYXradCbCIIntOBhxITBEGDVVq80gR6HBYFpIlFqMostUzG4CkVHMkQOVKtVatRsHB6PE4FdqNAAEqYYiYRpQkAwqpdADK9S2IBuXSE5GyM3w2C+CGoZQg2TKSAFWy5CAQESAA==",
    noSplits: "http://localhost:9090/#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhqZqJQgA0408SqGOAygKZobYDmZe2MCClGALZNkOJvhABRNAGMA9AFUAKgGEKIAGYQEaJgCcuAbVBoAngAdxBIeMp6mGiTfU2ACvqwATI6E8w96Fi4BK4AjAAi6lC65vgAtKECFlYgCOhM0SAAvgC6uZRQ5khoRjkFHhn4xiD2GvpM2DIpcJ6eTJ7qGph6guj4JskSbRpwvGjqYIgwKdlJlhLCcLD22WUg5hDY2O3hEMLYUEFGIDIAFnBbTAjq2HDChXBN6tAASpgARsQgaxuXngzdcYEFptDpZIA=",
    threeStringSplits: "http://localhost:9090/#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhpwBGCApiADSEQC2ZyOFBAomgMYD0AqgCoDCVEADMICNGQBOUfAG1QaAJ4AHZjXpDJZYfnUVqGegAUpWACYy88kGZiT0WXASMBGACJCoE5fgC0LgxU1BHQyLxAAXwBdaOooZSQ0S2slVV0vSQhsAHMhMzoybChHXXYACzhsbDIET0xJNHxQLR0CODMzMjMhVLUoUzC8iC12DBxdTqh2QvycoVVMzG6CSOokWghGvABWAAYIygUg9LRMuep8+iKSgmU4bP0QKHqt5u1dds7uwLSCfszBhdhmRRjcbGFpthZrlqAtzLpViB1pt8NsDkdfk9TlkYTYCtdxgR2JtFAA5OAaOIvJogFofDpdHrHP4DGRAkZjJzgqYzHHzUxLBEHJF0FE7WJPVlyN7CKSFab0r5CYT1WjoGm9CbaOAwcRCMCIGBqRGagj0OCwLSRKKwrLVMxufHFHDJEDlSrVWrUbAUsJ3BXUaAAJUwxEwjRtIGUdq6AGVqW0Gd8kWQHlD8NhdQhqGUINkykh81tMwgEBEgA"
    // tslint:enable:max-line-length
  };

  const shouldHaveSplits = (...splits: string[]) => {
    splitItems().should("have.length", splits.length);
    splitItemsRow().within(() => {
      splits.forEach((split, idx) => {
        cy.get(`.tile.dimension:nth-child(${idx + 1})`)
          .should("contain", split);
      });
    });
  };

  describe("No splits in View Definition", () => {
    beforeEach(() => {
      cy.visit(urls.noSplits);
    });

    it("should load with no splits", () => {
      splitItemsRow().should("be.empty");
    });

    it("should add Channel split with plus button", () => {
      addSplitButton().click();

      addSplitMenu().find(".label:contains('Channel')").click();

      shouldHaveSplits("Channel");
    });

    it("should add Channel split with plus button using search field", () => {
      addSplitButton().click();

      addSplitMenu().within(() => {
        cy.get(".search-box input").type("Channel");

        cy.get(".label")
          .should("have.length", 1)
          .should("contain", "Channel")
          .click();
      });

      shouldHaveSplits("Channel");
    });

    it("should add Channel split with dimension action", () => {
      dimensionTile("Channel").click();

      dimensionAddSplitAction().click();

      shouldHaveSplits("Channel");
    });

    it("should add Channel split with dimension action using search field", () => {
      dimensionsList().within(() => {
        cy.get(".icon.search").click();
        cy.get(".search-box input").type("Channel");
        cy.get(".rows .dimension")
          .should("have.length", 1)
          .should("contain", "Channel")
          .click();
      });

      dimensionAddSplitAction().click();

      shouldHaveSplits("Channel");
    });
  });

  describe("Channel split already in View Definition", () => {
    beforeEach(() => {
      cy.visit(urls.channelSplit);
    });

    it("should load with channel split", () => {
      shouldHaveSplits("Channel");
    });

    it("Channel should not be available in add split list", () => {
      addSplitButton().click();

      addSplitMenu().find(".label:contains('Channel')")
        .should("not.exist");
    });

    it("should add split with plus button", () => {
      addSplitButton().click();

      addSplitMenu().find(".label:contains('Page')").click();

      shouldHaveSplits("Channel", "Page");
    });

    it("Channel dimension should not have Add split action", () => {
      dimensionTile("Channel").click();

      dimensionAddSplitAction()
        .should("have.class", "disabled")
        .click();

      shouldHaveSplits("Channel");
    });

    it("should add split with dimension action", () => {
      dimensionTile("Page").click();

      dimensionAddSplitAction().click();

      shouldHaveSplits("Channel", "Page");
    });

    it("should replace split with dimension action", () => {
      dimensionTile("Page").click();

      dimensionReplaceSplitAction().click();

      shouldHaveSplits("Page");
    });
  });

  describe("Three splits already in View Definition", () => {
    beforeEach(() => {
      // Force viewport that shows overflows for three tiles
      cy.viewport(1200, 800);
      cy.visit(urls.threeStringSplits);
    });

    it("should load with two split tiles", () => {
      shouldHaveSplits("Channel", "Page");
    });

    it("should show overflow tile for third split", () => {
      splitOverflow().should("contain", "+1");
    });

    it("should show overflowed split after clicking tile", () => {
      splitOverflow().click();

      splitOverflowMenu().find(".tile.dimension")
        .should("contain", "City Name");
    });

    it("should open split menu inside overflow tile", () => {
      splitOverflow().click();

      splitOverflowMenu().find(".tile.dimension")
        .click();

      splitMenu().should("exist");
    });
  });

  describe("Remove action", () => {
    beforeEach(() => {
      cy.visit(urls.threeStringSplits);
    });

    it('should remove split after clicking "x" icon', () => {
      splitTile("Page").find(".remove")
        .click();

      shouldHaveSplits("Channel", "City Name");
    });
  });

  describe("Drag and drop", () => {
    const dataTransfer = new DataTransfer();
    beforeEach(() => {
      cy.visit(urls.channelSplit);
    });

    it("adds split by dropping dimension", () => {
      dimensionTile("Page")
        .trigger("dragstart", { dataTransfer });

      splitsContainer().trigger("dragenter");

      dragMask().trigger("drop");

      shouldHaveSplits("Channel", "Page");
    });

    it("replaces split by dropping dimension on existing split", () => {
      dimensionTile("Page")
        .trigger("dragstart", { dataTransfer });

      splitsContainer().trigger("dragenter");

      splitTile("Channel").then(([channelSplit]) => {
        const { left, width } = channelSplit.getBoundingClientRect();

        dragMask().trigger("drop", { clientX: left + width / 2 });

        shouldHaveSplits("Page");
      });
    });

    it("can not drop dimension for which split already exists", () => {
      dimensionTile("Channel")
        .trigger("dragstart", { dataTransfer });

      splitsContainer().trigger("dragenter");

      dragMask().should("not.exist");
    });

    it("rearranges splits", () => {
      cy.visit(urls.threeStringSplits);

      splitTile("Channel")
        .trigger("dragstart", { dataTransfer });

      splitsContainer().trigger("dragenter");

      splitTile("Page")
        .then(([timeSplit]) => {
          const { left, width } = timeSplit.getBoundingClientRect();

          dragMask().trigger("drop", { clientX: left + width });

          shouldHaveSplits("Page", "Channel", "City Name");
        });
    });
  });

  describe("Split menu", () => {
    beforeEach(() => {
      cy.visit(urls.allSplitTypes);
    });

    it("split menu has action buttons", () => {
      splitTile("Page").click();

      splitMenu().find(".button-bar .primary").should("contain", "OK");
      splitMenu().find(".button-bar .secondary").should("contain", "Cancel");
    });

    it("split menu OK action should be disabled upon menu opening", () => {
      splitTile("Page").click();

      splitMenu().find(".button-bar .primary").should("have.attr", "disabled");
    });

    it("split menu OK action should be enabled after changing split options", () => {
      splitTile("Page").click();

      splitMenu().find(".sort-direction .direction").click();

      splitMenu().find(".button-bar .primary").should("not.have.attr", "disabled");
    });

    describe("Time Split menu", () => {
      it("should show split menu for time dimension", () => {
        splitTile("Time").click();

        splitMenu().should("exist");
      });

      it("time split menu has granularity controls", () => {
        splitTile("Time").click();

        splitMenu().find(".button-group").within(() => {
          cy.get(".button-group-title").should("contain", "Granularity");
          cy.get(".group-container .group-member").should("have.length", 6);
          cy.get(".group-container .group-member.selected").should("exist");
          cy.get(".group-container .group-member:last").should("contain", "…");
        });
      });

      it('granularity "…" option show input box', () => {
        splitTile("Time").click();

        splitMenu().find(".button-group .group-member:last").click();

        splitMenu().find(".custom-input")
          .should("have.class", "invalid")
          .should("have.value", "")
          .should("have.attr", "placeholder", "e.g. PT2H or P3M");
      });

      it("time split menu has sort controls", () => {
        splitTile("Time").click();

        splitMenu().find(".sort-direction").within(() => {
          cy.get(".direction").should("have.class", "ascending");
          cy.get(".dropdown-label").should("contain", "Sort by");
          cy.get(".dropdown .selected-item").should("contain", "Time");
        });
      });

      it("time split menu has limit controls", () => {
        splitTile("Time").click();

        // TODO: add meaningful classnames for limit dropdown!
        cy.get(".split-menu > .dropdown.down").within(() => {
          cy.get(".dropdown-label").should("contain", "Limit");
          cy.get(".selected-item").should("contain", "None");
        });
      });
    });

    describe("Number Split menu", () => {
      it("should show split menu for number dimension", () => {
        splitTile("Comment").click();

        splitMenu().should("exist");
      });

      it("number split menu has granularity controls", () => {
        splitTile("Comment").click();

        splitMenu().find(".button-group").within(() => {
          cy.get(".button-group-title").should("contain", "Granularity");
          cy.get(".group-container .group-member").should("have.length", 6);
          cy.get(".group-container .group-member.selected").should("exist");
          cy.get(".group-container .group-member:last").should("contain", "…");
        });
      });

      it('granularity "…" option show input box', () => {
        splitTile("Comment").click();

        splitMenu().find(".button-group .group-member:last").click();

        splitMenu().find(".custom-input")
          .should("have.class", "invalid")
          .should("have.value", "")
          .should("have.attr", "placeholder", "Bucket size");
      });

      it("number split menu has sort controls", () => {
        splitTile("Comment").click();

        splitMenu().find(".sort-direction").within(() => {
          cy.get(".direction").should("have.class", "descending");
          cy.get(".dropdown-label").should("contain", "Sort by");
          cy.get(".dropdown .selected-item").should("contain", "Added");
        });
      });

      it("number split menu has limit controls", () => {
        splitTile("Comment").click();

        // TODO: add meaningful classnames for limit dropdown!
        cy.get(".split-menu > .dropdown.down").within(() => {
          cy.get(".dropdown-label").should("contain", "Limit");
          cy.get(".selected-item").should("contain", 5);
        });
      });
    });
  });
});
