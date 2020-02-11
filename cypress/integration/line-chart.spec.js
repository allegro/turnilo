/// <reference types="Cypress" />

context("Line Chart", () => {

  const header = () => cy.get(".cube-header-bar");
  const timeFilter = () => cy.get(".filter-tile .filter:first");
  const lineChart = () => cy.get(".measure-line-chart");
  const highlighter = () => lineChart().find(".highlighter");
  const highlighterFrame = () => highlighter().find(".frame");
  const highlightModal = () => cy.get(".highlight-modal");
  const acceptHighlight = () => highlightModal().find(".accept");
  const dropHighlight = () => highlightModal().find(".drop");

  describe("Highlight", () => {

    const urls = {
      timeSplit: "http://localhost:9090/#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhLYCmAtAMYAWcATmiADQgYC2xyOx+IAomuQHoAqgBUAwoxAAzCAjTEaUfAG1QaAJ4AHLgVZcmNYlO57JegAoKsAEyV5VIazBrosuAuYCMAEUlR5mviknkwa2twI6MT+IAC+ALoJTFCaSGh2DmE6zBBskta5xNhQbiaFkgDmLtgwkTQQGtzmIp4AEn6YdPighsa65aFa2QVsxaVMBYbkGDjccFDkRQXYFXFMSCwN+DUICEkgUFbRKj1GCkWLc9bWxNaSUp0s6N3MQ9w3UnC19ExgiDDZNavcIENjzZxcfaaCDYEjWbyFMY4DIgKhwWHEBCSbBwNgpOCXJjQABKmAARph6PEmNCMdYAMqdegEODXW6SBDECpLba1PZAA"
    };

    const assertHighlighterPosition = (expectedLeft, expectedWidth) =>
      highlighterFrame().should($frame => {
        const frame = $frame.get(0);
        expect(frame.offsetLeft).to.eq(expectedLeft);
        expect(frame.offsetWidth).to.eq(expectedWidth);
      });

    beforeEach(() => {
      cy.visit(urls.timeSplit);
    });

    describe("Highlight selection with click", () => {
      beforeEach(() => {
        lineChart().click(100, 200);
      });

      describe("selecting highlight", () => {
        it("should show highlight modal", () => {
          highlightModal().should("exist");
        });

        it("should show time period on highlight modal", () => {
          highlightModal().should("contain", "12 Sep 2015 3:00 - 12 Sep 2015 4:00");
        });

        it("should show highlighter", () => {
          highlighter().should("exist");
        });

        it("should show highlighter on correct coordinates", () => {
          assertHighlighterPosition(90, 30);
        });
      });

      describe("accept highlight", () => {
        it("should hide highlight modal", () => {
          acceptHighlight().click();

          // we check for line chart existence first, so cypress won't give us false positive
          // because base-visualisation shows loader
          lineChart().should("exist");
          highlightModal().should("not.exist");
        });

        it("should hide highlighter", () => {
          acceptHighlight().click();

          // we check for line chart existence first, so cypress won't give us false positive
          // because base-visualisation shows loader
          lineChart().should("exist");
          highlighter().should("not.exist");
        });

        it("should change time filter", () => {
          acceptHighlight().click();

          timeFilter().should("contain", "12 Sep 2015 3:00 - 12 Sep 2015 4:00");
        });
      });

      describe("reselect highlight", () => {
        it("should show moved highlight modal", () => {
          lineChart().click(500, 200);

          highlightModal().should("contain", "12 Sep 2015 16:00 - 12 Sep 2015 17:00");
        });

        it("should show moved highlighter", () => {
          lineChart().click(500, 200);

          assertHighlighterPosition(480, 30);
        });
      });

      describe("drop highlight", () => {
        it("should hide highlight modal after clicking cancel button", () => {
          dropHighlight().click();

          highlightModal().should("not.exist");
        });

        it("should hide highlight modal after clicking cancel button", () => {
          dropHighlight().click();

          highlighter().should("not.exist");
        });

        it("should hide highlight modal after clicking outside visualisation", () => {
          header().click();

          highlightModal().should("not.exist");
        });

        it("should hide highlighter after clicking outside visualisation", () => {
          header().click();

          highlighter().should("not.exist");
        });
      });
    });

    describe("Highlight selection with drag", () => {
      beforeEach(() => {
        lineChart()
          .trigger("mousedown", 200, 100)
          .trigger("mousemove", 500, 100)
          .trigger("mouseup");
      });

      it("should show highlight modal", () => {
        highlightModal().should("exist");
      });

      it("should show time period on highlight modal", () => {
        highlightModal().should("contain", "12 Sep 2015 6:00 - 12 Sep 2015 14:00");
      });

      it("should show highlighter", () => {
        highlighter().should("exist");
      });

      it("should show highlighter on correct coordinates", () => {
        assertHighlighterPosition(180, 240);
      });
    });
  });
});
