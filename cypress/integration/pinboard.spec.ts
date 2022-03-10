context("Pinboard", () => {

  const pinboardPanel = () => cy.get(".pinboard-panel");
  const pinboardMeasureTile = () => pinboardPanel().find(".pinboard-measure-tile");
  const pinboardSort = () => pinboardMeasureTile().find(".dropdown");
  const pinboardSortError = () => pinboardMeasureTile().find(".pinboard-sort-error");
  const pinboardSortSelected = () => pinboardSort().find(".selected-item");
  const pinboardTiles = () => pinboardPanel().find(".pinboard-tile");
  const measureTile = (title) => cy.get(`.series.measure:contains(${title})`);

  describe("Pinboard", () => {
    const urls = {
      wiki: "http://localhost:9090/#wiki",
    };

    beforeEach(() => {
      cy.visit(urls.wiki);
    });

    it("should show pinboard", () => {
      pinboardPanel().should("exist");
    });

    it("should show three pinboard tiles", () => {
      pinboardTiles().should("have.length", 3);
    });

    describe("Pinboard Sort", () => {
      it("should show pinboard sort selector", () => {
        pinboardSort().should("exist");
      });

      it("should select Added as pinboard sort", () => {
        pinboardSortSelected().should("contain", "Added");
      });

      describe("After removing last measure", () => {
        beforeEach(() => {
          measureTile("Added").find(".remove").click();
        });

        it("should show error", () => {
          pinboardSortError().should("contain", "No measure selected");
        });

        it("should hide pinboard tiles", () => {
          pinboardTiles().should("have.length", 0);
        });
      });
    });
  });
});
