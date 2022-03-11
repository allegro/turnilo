context("Table", () => {

  const header = () => cy.get(".cube-header-bar");
  const filterTileRow = () => cy.get(".filter-tile");
  const filterTile = (i) => filterTileRow().find(`.filter:nth-child(${i})`);
  const table = () => cy.get(".table");
  const clickTarget = () => table().find(".event-target");
  const highlightModal = () => cy.get(".highlight-modal");
  const acceptHighlight = () => highlightModal().find(".accept");
  const dropHighlight = () => highlightModal().find(".drop");
  const findSplitValue = label => table().find(`.split-value:contains("${label}")`);
  const nthRow = n => table().find(`.measure-row:nth-child(${n})`);

  describe("Highlight", () => {
    const urls = {
      threeSplits: "http://localhost:9090/#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhpwBGCApiADSEQC2ZyOFBAomgMYD0AqgCoDCVEADMICNGQBOUfAG1QaAJ4AHZjXpDJZYfnUVqGegAUpWACYy88kGZiT0WXASMBGACJCoE5fgC0LgxU1BHQyLxAAXwBdaOooZSQ0S2slVV0vSQhsAHMhMzoybChHXXYACzhsbDIET0xJNHxQLR0CODMzMjMhVLUoUzC8iC12DBxdTqh2QvycoVVMzG6CSOokWghGvABWAAYIygUg9LRMuep8+iKSgmw4eni4abqGppAW3XbO7sC0gn7MoMLsMyKMbjYwtNsLNctQFuZdKsQOtNvhtgcjn8QBksrCbAVruMCMo4Nl9Nj6ltmtpPh0uj1jv8BjJgSMxk4IVMZrj5qYloiDsi6KidvsonFmXJqcIpIVnm06T8RPVaOg3r0Jto4DBxEIwIgYGokRqCPQ4LAtJFxSBlFlqmY3ATijhkiBypVqrVqHcHiTntRoAAlTDETCNa22qpdADKlNp3yE5DJ0Pw2B1CAiQA="
    };

    beforeEach(() => {
      cy.visit(urls.threeSplits);
      clickSplitValue("Main");
    });

    function clickSplitValue(label) {
      return findSplitValue(label)
        .then($splitValue => {
          const {top: scrollerOffset} = $splitValue.closest(".scroller").offset();
          const {left, top: splitValueOffset} = $splitValue.offset();
          const height = $splitValue.height();
          // force because we have overlay upon overlay in table
          clickTarget().click(left, splitValueOffset - scrollerOffset + (height / 2), {force: true});
        });
    }

    function assertSplitValueRowHighlight(label) {
      const splitValue = findSplitValue(label);
      splitValue
        .should("have.class", "highlight")
        .then($splitValue => {
          const index = $splitValue.index();
          nthRow(index + 1).should("have.class", "highlight");
        });
    }

    function assertNoRowHighlightIsSelected() {
      table().find(".row.selected").should("not.exist");
      table().find(".split-value.selected").should("not.exist");
    }

    function assertFilterTileValues(values) {
      values.forEach((value, idx) => {
        filterTile(idx + 1).should("contain", value);
      });
    }

    describe("selecting highlight", () => {
      it("should show highlight modal", () => {
        highlightModal().should("exist");
      });

      it("should show time period on highlight modal", () => {
        highlightModal().should("contain", "Main");
      });

      it("should show row highlight", () => {
        assertSplitValueRowHighlight("Main");
      });
    });

    describe("accept highlight", () => {
      it("should hide highlight modal", () => {
        acceptHighlight().click();

        // we check for table existence first, so cypress won't give us false positive
        // because base-visualisation shows loader
        table().should("exist");
        highlightModal().should("not.exist");
      });

      it("should hide row highlight", () => {
        acceptHighlight().click();

        assertNoRowHighlightIsSelected();
      });

      it("should change filter", () => {
        acceptHighlight().click();

        assertFilterTileValues(["Latest day", "Channel:en", "Namespace:Main"]);
      });
    });

    describe("reselect highlight", () => {
      it("should show moved highlight modal", () => {
        clickSplitValue("Lava Fire");

        highlightModal().should("contain", "Lava Fire");
      });

      it("should show moved highlighter", () => {
        clickSplitValue("Lava Fire");

        assertSplitValueRowHighlight("Lava Fire");
      });
    });

    describe("drop highlight", () => {
      it("should hide highlight modal after clicking cancel button", () => {
        dropHighlight().click();

        highlightModal().should("not.exist");
      });

      it("should hide highlight modal after clicking cancel button", () => {
        dropHighlight().click();

        assertNoRowHighlightIsSelected();
      });

      it("should hide highlight modal after clicking outside visualisation", () => {
        header().click();

        highlightModal().should("not.exist");
      });

      it("should hide highlighter after clicking outside visualisation", () => {
        header().click();

        assertNoRowHighlightIsSelected();
      });
    });

  });
});
