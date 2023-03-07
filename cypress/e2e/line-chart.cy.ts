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
context("Line Chart", () => {

  const header = () => cy.get(".cube-header-bar");
  const topBar = () => cy.get(".center-top-bar:not(.fallback)");
  const filterTiles = () => topBar().find(".filter-tile-row");
  const timeFilter = () => filterTiles().get(".tile:first");
  const lineChart = () => cy.get(".line-base-chart");
  const chartLine = () => lineChart().find(".chart-line");
  const highlighter = () => lineChart().find(".highlighter");
  const highlighterFrame = () => highlighter().find(".frame");
  const highlightModal = () => cy.get(".highlight-modal");
  const acceptHighlight = () => highlightModal().find(".accept");
  const dropHighlight = () => highlightModal().find(".drop");
  const visSelector = () => topBar().find(".vis-item");
  const visSelectorMenu = () => cy.get(".vis-selector-menu");
  const visSelectorOk = () => visSelectorMenu().find(".button.primary");
  const visSettings = () => cy.get(".vis-settings");
  const groupSeriesCheckbox = () => visSettings().find(".checkbox");

  const urls = {
    // tslint:disable:max-line-length
    nominalSplit: "http://localhost:9090/#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhLYCmAtAMYAWcATmiADTjTxKoY4DKxaG2A5lHyh+NTDAAO3GhGJC8AM0RRiAXyYYAtsWQ5i+EAFE05APQBVACoBhRiAUQEaYjXkBtUGgCeE/QS36TDTECgYBdgEACi5YACbuoLEwNOhYuASRAIwAInZQzhL4pJkaPn6E6HL0qgC6tUxQEkhoCSDevgb5MgJ2sRDa2FBpBtAAcsQA7nmYdMIgwaEEcLGxxLERZZ0xcr0QweQc6SCrUOTE2H09TL4ymOsEIOqE/RD0eJkADOqem/79gcd/oNhn9tHZRHBsDAELRXl4DJFLJkABLTWZ4UALML/DYdAh9AZDHC7faHAxwU7nS78R5MJCaV74KEIBD1EAqGQ7PAeeYhFznM7klZrOwKGaadBzdrlVZKaH0JhgRAwcq0tq/EDaCnJfRsiQQbAkWLZIFEwb4NwgKiQkgIOzYODaRpwQVMaAAJUwACNMPQatcDUbODM3iBlqt1qogA",
    nominalSplitGroupedSeries: "http://localhost:9090/#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhLYCmAtAMYAWcATmiADTjTxKoY4DKxaG2A5lHyh+NTDAAO3GhGJC8aGjGIBfJhgC2xZDmL4QAUTTkA9AFUAKgGFGIAGYQEaYjXkBtUGgCeEvQU16TDTEdvoBtgEACi5YACbuoLEwNOhYuASRAIwAIrZQzhL4pJnqPn6E6HL0KgC6tUxQEkhoCSDevvr5MgK2sRBa2FBp+tAAcsQA7nmYdMIgwaEEcLGxxLERZZ0xcr0QweQc6SCrUOTE2H09TL4ymOsEIGqE/RD0eJkADGqem/79gcd/oNhn8tLZRHBsDAELRXl59JELJkABLTWZ4UALML/DYdAh9AZDHC7faHfRwU7nS78R5MJAaV74KEIBD1EBQbatBYuc5nckrNa2OwzDToObtcqrOxwaH0JhgRDKfS0tq/EBaCnJPRsiQQbAkWLZIFEwb4NwgKiQkgIWzYOBaRpwPlMaAAJUwACNMPQatc9QbODM3iBlqt1iogA===",
    nominalSplitTwoMeasures: "http://localhost:9090/#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhLYCmAtAMYAWcATmiADTjTxKoY4DKxaG2A5lHyh+NTDAAO3GhGJC8AM0RRiAXyYYAtsWQ5i+EAFE05APQBVACoBhRiAUQEaYjXkBtUGgCeE/QS36TDTECgYBdgEACi5YACbuoLEwNOhYuASRAIwAInZQzhL4pJkaPn6E6HL0qgC6tUxQEkhoCSDevgb5MgJ2sRDa2FBpBtAAcsQA7nmYdMIgwaEEcLGxxLERZZ0xcr0QweQc6SCrUOTE2H09TL4ymOsEIOqE/RD0eJkADOqem/79gcd/oNhn9tHZRHBsDAELRXl4DJFLJkABLTWZ4UALML/DYdAh9AZDHC7faHAxwU7nS78R5MJCaV74KEIBD1EAqGQ7PAeeYhFznM7klZrOwKGaadBzdrlVZKaH0JhgRAwcq0tq/EDaCnJfTfXkKfnYQX44gIHgiphimgSt4/PHHEJweV2JUIFUGNXSgxa2DBR41a4QbAkWLZIFEwb4NwgKiQkgIOzYODaRpwQVMaAAJUwACNMPQAyAJEGQ5wZm8QMtVutVEA",
    nominalSplitTwoMeasuresGroupedSeries: "http://localhost:9090/#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhLYCmAtAMYAWcATmiADTjTxKoY4DKxaG2A5lHyh+NTDAAO3GhGJC8aGjGIBfJhgC2xZDmL4QAUTTkA9AFUAKgGFGIAGYQEaYjXkBtUGgCeEvQU16TDTEdvoBtgEACi5YACbuoLEwNOhYuASRAIwAIrZQzhL4pJnqPn6E6HL0KgC6tUxQEkhoCSDevvr5MgK2sRBa2FBp+tAAcsQA7nmYdMIgwaEEcLGxxLERZZ0xcr0QweQc6SCrUOTE2H09TL4ymOsEIGqE/RD0eJkADGqem/79gcd/oNhn8tLZRHBsDAELRXl59JELJkABLTWZ4UALML/DYdAh9AZDHC7faHfRwU7nS78R5MJAaV74KEIBD1EBQbatBYuc5nckrNa2OwzDToObtcqrOxwaH0JhgRDKfS0tq/EBaCnJPTfeYhHnYPn44gIHiCpjCmiit4/PHHEIypy2BUIJUPJ4S/Qa2DBR41a4QbAkWLZIFEwb4NwgKiQkgIWzYOBaRpwPlMaAAJUwACNMPQ/SAJAGg5wZm8QMtVusVEA===",
    timeSplit: "http://localhost:9090/#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhLYCmAtAMYAWcATmiADTjTxKoY4DKxaG2A5lHyh+NTDAAO3GhGJC8AM0RRiAXyYYAtsWQ5i+EAFE05APQBVACoBhRiAUQEaYjXkBtUGgCeE/QS36TDTECgYBdgEACi5YACbuoLEwNOhYuASRAIwAInZQzhL4pJkaPn6E6HL0qgC6tUxQEkhoCSDevmEQ2naxXcTYUGmd3UyicNgwCLQQ3gaRlpkAEnmYdMIgwaH+fRFlBr3aA0NMvcHkHOkgcFDk/b0CIOqEXTP4EwgI9SAqMnL4HhsQi5+rcDHBYrFiLE7ApVpp0Ot2uVIUpJvQmGBEDByo9Sh0CNprsl9F8JBBsCRYtk+kccO4QFRxiQEHZsHBtI04KCmNAAEqYABGmHoNSYZIpUM4q3oBHBkOhqiAA=",
    timeSplitGroupedSeries: "http://localhost:9090/#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhLYCmAtAMYAWcATmiADTjTxKoY4DKxaG2A5lHyh+NTDAAO3GhGJC8aGjGIBfJhgC2xZDmL4QAUTTkA9AFUAKgGFGIAGYQEaYjXkBtUGgCeEvQU16TDTEdvoBtgEACi5YACbuoLEwNOhYuASRAIwAIrZQzhL4pJnqPn6E6HL0KgC6tUxQEkhoCSDevmEQWraxXcTYUGmd3UyicNgwCLQQ3vqRFpkAEnmYdMIgwaH+fRFl+r1aA0NMvcHkHOkgcFDk/b0CIGqEXTP4EwgI9SBQMXL4HhsQi5+rd9HBYrFiLFbHZVhp0Ot2uVIXY4JN6EwwIhlPpHqUOgQtNdknovhIINgSLFsn0jjh3CAqOMSAhbNg4FpGnBQUxoAAlTAAI0w9BqTHJlKhnFW9AI4Mh0JUQA",
    twoMeasures: "http://localhost:9090/#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhLYCmAtAMYAWcATmiADTjTxKoY4DKxaG2A5lHyh+NTDAAO3GhGJC8AM0RRiAXyYYAtsWQ5i+EAFE05APQBVACoBhRiAUQEaYjXkBtUGgCeE/QS36TDTECgYBdgEACi5YACbuoLEwNOhYuASRAIwAInZQzhL4pJkaPn6E6HL0qgC6tUxQEkhoCSDevmEQ2naxXcTYUGmd3UyicNgwCLQQ3gaRlpkAEnmYdMIgwaH+fRFlBr3aA0NMvcHkHOkgcFDk/b0CIOqEXTP4EwgI9SAqMnL4HhsQi5+rcDHBYrFiLE7ApVpp0Ot2uVIUpJvQmGBEDByo9Sh0CNprsl9OpQJtgdhQQRIQgeFCYXCEXhPHtqSE4Gi7JiENiDLi2qyQITYMFHjUmBIINgSLFsn0jjh3CAqOMSAg7Ng4NpGnBQUxoAAlTAAI0w9HFIEl0qhnFW9AI4Mh0NUQA=",
    twoMeasuresGroupedSeries: "http://localhost:9090/#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhLYCmAtAMYAWcATmiADTjTxKoY4DKxaG2A5lHyh+NTDAAO3GhGJC8aGjGIBfJhgC2xZDmL4QAUTTkA9AFUAKgGFGIAGYQEaYjXkBtUGgCeEvQU16TDTEdvoBtgEACi5YACbuoLEwNOhYuASRAIwAIrZQzhL4pJnqPn6E6HL0KgC6tUxQEkhoCSDevmEQWraxXcTYUGmd3UyicNgwCLQQ3vqRFpkAEnmYdMIgwaH+fRFl+r1aA0NMvcHkHOkgcFDk/b0CIGqEXTP4EwgI9SBQMXL4HhsQi5+rd9HBYrFiLFbHZVhp0Ot2uVIXY4JN6EwwIhlPpHqUOgQtNdkno1KBNsDsKCCJCEDwoTC4Qi8J49jSQminLYsQgcQQ8W02SAibBgo8akwJBBsCRYtk+kccO4QFRxiQELZsHAtI04KCmNAAEqYABGmHoEpAUplUM4q3oBHBkOhKiAA==="
    // tslint:enable:max-line-length
  };

  describe("Base chart", () => {
    describe("Settings panel", () => {
      const toggle = () => groupSeriesCheckbox().click();
      const save = () => visSelectorOk().click();

      describe("Group series is false", () => {
        beforeEach(() => {
          cy.visit(urls.timeSplit);
          visSelector().click();
        });

        it("should open menu with unchecked 'Group series'", () => {
          groupSeriesCheckbox().should("not.have.class", "selected");
        });

        it("should switch url when setting 'Group series'", () => {
          toggle();

          save();

          cy.location("href").should("equal", urls.timeSplitGroupedSeries);
        });
      });

      describe("Group series is true", () => {
        beforeEach(() => {
          cy.visit(urls.timeSplitGroupedSeries);
          visSelector().click();
        });

        it("should open menu with unchecked 'Group series'", () => {
          groupSeriesCheckbox().should("have.class", "selected");
        });

        it("should switch url when setting 'Group series'", () => {
          toggle();

          save();

          cy.location("href").should("equal", urls.timeSplit);
        });
      });
    });

    describe("Default settings (No group series)", () => {
      describe("Without nominal split", () => {
        describe("Single measure", () => {
          beforeEach(() => {
            cy.visit(urls.timeSplit);
          });

          it("should show one chart", () => {
            lineChart().should("have.length", 1);
          });

          it("should show one line on chart", () => {
            chartLine().should("have.length", 1);
          });
        });

        describe("Two measures", () => {
          beforeEach(() => {
            cy.visit(urls.twoMeasures);
          });

          it("should show two charts", () => {
            lineChart().should("have.length", 2);
          });

          it("should show one line per chart", () => {
            chartLine().should("have.length", 2);
          });
        });
      });

      describe("With nominal split", () => {
        describe("Single measure", () => {
          beforeEach(() => {
            cy.visit(urls.nominalSplit);
          });

          it("should show one chart", () => {
            lineChart().should("have.length", 1);
          });

          it("should show two lines on chart", () => {
            chartLine().should("have.length", 2);
          });
        });

        describe("Two measures", () => {
          beforeEach(() => {
            cy.visit(urls.nominalSplitTwoMeasures);
          });

          it("should show two charts", () => {
            lineChart().should("have.length", 2);
          });

          it("should show two lines per chart", () => {
            chartLine().should("have.length", 4);
          });
        });
      });
    });

    describe("Group series Setting", () => {
      describe("Without nominal split", () => {
        describe("Single measure", () => {
          beforeEach(() => {
            cy.visit(urls.timeSplitGroupedSeries);
          });

          it("should show one chart", () => {
            lineChart().should("have.length", 1);
          });

          it("should show one line on chart", () => {
            chartLine().should("have.length", 1);
          });
        });

        describe("Two measures", () => {
          beforeEach(() => {
            cy.visit(urls.twoMeasuresGroupedSeries);
          });

          it("should show one chart", () => {
            lineChart().should("have.length", 1);
          });

          it("should show two lines on chart", () => {
            chartLine().should("have.length", 2);
          });
        });
      });

      describe("With nominal split", () => {
        describe("Single measure", () => {
          beforeEach(() => {
            cy.visit(urls.nominalSplitGroupedSeries);
          });

          it("should show two charts", () => {
            lineChart().should("have.length", 2);
          });

          it("should show one line on chart", () => {
            chartLine().should("have.length", 2);
          });
        });

        describe("Two measures", () => {
          beforeEach(() => {
            cy.visit(urls.nominalSplitTwoMeasuresGroupedSeries);
          });

          it("should show two charts", () => {
            lineChart().should("have.length", 2);
          });

          it("should show two lines per chart", () => {
            chartLine().should("have.length", 4);
          });
        });
      });
    });
  });

  describe("Highlight", () => {
    const assertHighlighterPosition = (expectedLeft: number, expectedWidth: number) =>
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
          assertHighlighterPosition(92, 31);
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

      describe("resetting highlight", () => {
        it("should remove highlight modal", () => {
          lineChart().click(500, 200);

          highlightModal().should("not.exist");
        });

        it("should remove highlighter", () => {
          lineChart().click(500, 200);

          highlighter().should("not.exist");
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
        highlightModal().should("contain", "12 Sep 2015 6:00 - 12 Sep 2015 13:00");
      });

      it("should show highlighter", () => {
        highlighter().should("exist");
      });

      it("should show highlighter on correct coordinates", () => {
        assertHighlighterPosition(185, 216);
      });
    });
  });
});
