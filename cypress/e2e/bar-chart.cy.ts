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
context("Bar Chart", () => {

  const barChart = () => cy.get(".bar-chart");
  const xAxis = () => cy.get(".bar-chart-x-axis");
  const ticks = () => xAxis().find("g");
  const firstSeries = () => barChart().get(".bar-chart-bars:first");
  const bars = () => firstSeries().find(".bar-chart-bar");
  const previousBars = () => firstSeries().find(".bar-chart-bar-previous");
  const segments = () => firstSeries().find(".bar-chart-bar-segment");
  const previousSegments = () => firstSeries().find(".bar-chart-bar-previous-segment");
  const legend = () => cy.get(".bar-chart-legend");
  const legendValue = (idx: number) => legend().find(`.legend-value:nth-child(${idx}) .legend-value-name`);

  const urls = {
    // tslint:disable:max-line-length
    nominalSplit: "http://localhost:9090/#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwgBGcATgLQDGAFqWiADTjTxKoY4DKApmhtgOZR82GAgSMMAWy7IcXfCACiaCgHoAqgBUAwgxAAzCAjRcSQvAG1QaAJ4AHeQSnzGJLvoXO9zgAqmsACbmViABMCToWLgEPgCMACJ6UCZ2+GSxEvaOIAjoXMkgAL4AuiWMUHZIaMHWWQrJJBACegEQ0thQUQrUcNjYXAhJmCR0eKBuHgRwAQFcAd51BFD++S0QbhTs0aH5FFzYrc2MDo2Y8wRFjEiSEKMArIX0tQ6ebS6hbx1dTm96/BEiXKNWwKHyaWIACSGI3w43cr2kCxeBFa7U6ODWGy2CjgUD2Bya/EuOTat2EogQZRAy0aq0scP0pn2exxMzmen0w0k6FhIFsyJ2+jgojojDAiBg2WJ/Oy0lx4XkVLsTX6AXin3RHXwFhAPT6Az02Dg0gqcBZjGgACVMIRMHRiscVXMOMNRiBprN5oUgA==",
    nominalSplitWithTimeShift: "http://localhost:9090/#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwgBGcATgLQDGAFqWiADTjTxKoY4DKApmhtgOZR82GAgSMMAWy7IcXfCACiaCgHoAqgBUAwgxAAzCAjRcSQvAG1QaAJ4AHeQSnzGJLvoXO9zgAqmsACbmViABMCToWLgEPpoAjAASelAmdvhkcRL2jiAI6FwpIAC+ALqljFB2SGjB1tkKKSQQAnoBENLYUFEK1HDY2FwIyZgkdHigbh4EcAEBXAHe9QRQ/gWtEG4U7NGhBRRc2G0tjA5NmAsExYxIkhBjAKxF9HUOnu0uoe+d3U7vevwRER5Jq2BSxOIAWWGo3wE3cb2ki1eBDaHS6OHWm22CjgUH2h2a/CuuXad2EogQ5RAKyaa0scP0pgO+xxs3men0I0k6FhIFsyN2+jgojojDAiBgOWJ/Jy0lx4XkVLszQGAQAIl90Z18BYQL1+oM9Ng4NJKnAWYxoAAlTCETB0EonFXzDgjMYgGZzBYSd4cKgQfTu2IAJiSRSAA",
    timeSplit: "http://localhost:9090/#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwgBGcATgLQDGAFqWiADTjTxKoY4DKApmhtgOZR82GAgSMMAWy7IcXfCACiaCgHoAqgBUAwgxAAzCAjRcSQvAG1QaAJ4AHeQSnzGJLvoXO9zgAqmsACbmViABMCToWLgEPgCMACJ6UCZ2+GSxEvaOIAjoXMkgAL4AuiWMUHZIaMHWWZ4Q0noBDVzYUFH1jYz8ESK5JBC2Cj6asQASSZgkdHigbh5OLd51BM3SbR2MzW4U7NEgcFAUrc0CRYxIkoPCoghlIFD++fgh86atxwpwAQFcAXr6KaSdD4WoOBS/fRwUR0RhgRAwbLnEC2cEEaSHcLye52CDYbB/eItDY4YIgahwfFcBB6bBwaQVOCfRjQABKmEImDoxUYuKpAQ4UxmBx+fyKQA",
    timeSplitWithTimeShift: "http://localhost:9090/#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwgBGcATgLQDGAFqWiADTjTxKoY4DKApmhtgOZR82GAgSMMAWy7IcXfCACiaCgHoAqgBUAwgxAAzCAjRcSQvAG1QaAJ4AHeQSnzGJLvoXO9zgAqmsACbmViABMCToWLgEPpoAjAASelAmdvhkcRL2jiAI6FwpIAC+ALqljFB2SGjB1tmeENJ6AY1c2FBRDU2M/BEieSQQtgqxcQCyyZgkdHigbh5Ord71BC3S7Z2MLW4U7NEgcFAUbS0CxYxIkkPCogjlIFD+Bfgh86ZtxwpwAQFcAXr6KaSdD4OoOBS/fRwUR0RhgRAwHLnEC2cEEaSHcLye52CDYbB/AAirQ2OGCIGocHxXAQemwcGklTgn0Y0AASphCJg6CVGLjqQEOFMZgcfn9vK0OFQIPoRbEAExJIpAA=="
    // tslint:enable:max-line-length
  };

  describe("Time split", () => {
    beforeEach(() => {
      cy.visit(urls.timeSplit);
    });

    it("should load bar-chart", () => {
      barChart().should("exist");
    });

    describe("x-axis", () => {
      it("should load three ticks", () => {
        ticks().should("have.length", 3);
      });
    });

    describe("bars", () => {
      it("should load 24 bars", () => {
        bars().should("have.length", 24);
      });
    });

    describe("with time-shift", () => {
      beforeEach(() => {
        cy.visit(urls.timeSplitWithTimeShift);
      });

      describe("bar segments", () => {
        it("should load 60 bars for current series", () => {
          bars().should("have.length", 60);
        });

        it("should load 60 bars for previous series", () => {
          previousBars().should("have.length", 60);
        });
      });
    });
  });

  describe("Time with nominal split", () => {
    beforeEach(() => {
      cy.visit(urls.nominalSplit);
    });

    describe("legend", () => {
      it("should render Legend", () => {
        legend().should("exist");
      });

      it("should render Legend header", () => {
        legend().find(".legend-header").should("have.text", "Channel");
      });

      function assertLegendRowsInOrder(...values: string[]) {
        values.forEach((label, idx) => {
          legendValue(idx + 1).should("contain", label);
        });
      }

      it("should render Legend values", () => {
        assertLegendRowsInOrder("en", "it", "fr", "ru", "es");
      });
    });

    describe("bar segments", () => {
      it("should load 120 bar segments", () => {
        segments().should("have.length", 120);
      });
    });

    describe("with time-shift", () => {
      beforeEach(() => {
        cy.visit(urls.nominalSplitWithTimeShift);
      });

      describe("bar segments", () => {
        it("should load 193 segments for current series", () => {
          segments().should("have.length", 193);
        });

        it("should load 193 segments for previous series", () => {
          previousSegments().should("have.length", 193);
        });
      });
    });
  });
});
