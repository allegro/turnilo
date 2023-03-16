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
context("Line Chart Legend", () => {

  const legend = () => cy.get(".line-chart-legend");
  const legendTitle = () => legend().find(".legend-header");
  const legendValues = () => legend().find(".legend-value");
  const legendValue = (idx: number) => legend().find(`.legend-value:nth-child(${idx})`);
  const legendValueName = (idx: number) => legendValue(idx).find(".legend-value-name");

  const urls = {
    // tslint:disable:max-line-length
    baseLineChart: "http://localhost:9090/#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhLYCmAtAMYAWcATmiADTjTxKoY4DKxaG2A5lHzYYCBEwwBbYshzF8IAKJpyAegCqAFQDCjEADMICNMRpC8AbVBoAngAd5BKfKY1i+hc73OACqawAJuZWIAEwNOhYuAQ+AIwAInpQJnb4pLES9o6E6MTJIAC+ALrFTFB2SGjB1lkKyTQQAnoBENLYUFEKVHDYJAhJmHT4oG4eBHABAcQB3rUEUP55zRBu5BzRoXnkxNgtTUwODZgzBIVMSJIQ9HgArAUMNQ6erS6hL+2dTi96/BEiCLQrjYFD5NLEABIDIZ4EbuZ7SWZPAgtNodHDLVbrBRwKDbXaNfhnQitK7CUQIUogBYNJaWWH6Uw7bbYybTPT6QaSdDDEC2JGbfRwUT0JhgRAwbJEvnZaQ48LySl2RokALxd5o9r4Cwgbq9Yj9JjYODScpwZlMaAAJUwACNMPQigdldNOINriAJlMZgUgA=",
    groupedBySeries: "http://localhost:9090/#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhLYCmAtAMYAWcATmiADTjTxKoY4DKxaG2A5lHyh+NTDAAO3GhGJC8aGjGIBfJhgC2xZDmL4QAUTTkA9AFUAKgGFGIAGYQEaYjXkBtUGgCeEvQU16TDTEdvoBtgEACi5YACbuoLEwNOhYuASRAIwAIrZQzhL4pJnqPn6E6HL0KgC6tUxQEkhoCSDevmEQWraxXcTYUGmd3UyicNgwCLQQ3vqRFpkAEnmYdMIgwaH+fRFl+r1aA0NMvcHkHOkgcFDk/b0CIGqEXTP4EwgI9SBQMXL4HhsQi5+rd9HBYrFiLFbHZVhp0Ot2uVIXY4JN6EwwIhlPpHqUOgQtNdkno1KBNsDsKCCORxNgMfY4Qi8J49gQUWinLYsQgcQQ8W02SAibBgo8akwJBBsCRYtk+kccO4QFRxiQELZsHAtI04KCmNAAEqYABGmHoEpAUplUM4q3oBHBkOhKiAA===",
    secondSplitDimensionFiltered: "http://localhost:9090/#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhLYCmAtAMYAWcATmiADTjTxKoY4DKxaG2A5lHzYYCBEwwBbYshzF8IAKJpyAegCqAFQDCjEADMICNMRpC8AbVBoAngAd5BKfKY1i+hc73OACqawAJuZWIAEwNOhYuAQ+AIwAInpQJnb4pLES9o6E6MTJIAC+ALoFDNZZCsk0EAJ6bh4EVHDYJAh6cOQc0SA1emCIMHn4FiAAVnB9EHp29EVM2Jj0ePqIUMTFTFB2SGjB5Q6VaNW1TAEQ0thQUQpNLcRtm5h0+KD1CnABAcQB3hUEa9UhqcIG5OtcCF8oORiNgzicQA5qpgfgRCkwkJIIEsAKylfbZLzAi5XHCec4uED8CIiBC0LE2BQ+TSxAASSSeS1e7jJ0l+Bwh5Mu12BoK67yhMLh/DRhHOWOEogQGxAAIgQ0sXP0phh0Pen2+en0T0k6BeIFs/NC7jgonoTH6CEGChlFuy0jgsDchTmCJqJAC8UFJMuwxAt1aemwcGkWw6FOgACVMAAjRYgH12P3fTgcvVfH4FIA==",
    secondSplitSortedByDimension: "http://localhost:9090/#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhLYCmAtAMYAWcATmiADTjTxKoY4DKxaG2A5lHzYYCBEwwBbYshzF8IAKJpyAegCqAFQDCjEADMICNMRpC8AbVBoAngAd5BKfKY1i+hc73OACqawAJuZWIAEwNOhYuAQ+AIwAInpQJnb4pLES9o6E6MTJIAC+ALrFTFB2SGjB1lkKyTQQAnoBENLYUFEKVHDYJAhJmHT4oG4eBN29xP2ZDgotbR04zRBu5BzRIHBQ5MTYLU0FTEiSEPR4AKyHNbNOrS6hd+2dt9J6/BEiCLSnNgo+mrEABIDIZ4EbuTx3by1AjzXaLXBMFqrdYKLY7PaNfiFI6tU7CUQIUogKD+PL4EKjUy7HZogIBYgBPT6QaSdDDEC2G4gYgADzgaz0YEQMGyOM5MJA0i24XkxLsjRIAXijwRwRAEz6emwcGk5QF92gACVMAAjTD0IpMBWTAKcQZnTb0xmFIA"
    // tslint:enable:max-line-length
  };

  function assertLegendRowsInOrder(...values: string[]) {
    const rows = legendValues();
    rows.should("have.length", values.length);

    values.forEach((label, idx) => {
      legendValueName(idx + 1).should("contain", label);
    });
  }

  describe("Legend render", () => {
    describe("Split charts", () => {
      beforeEach(() => {
        cy.visit(urls.baseLineChart);
      });

      it("should render legend", () => {
        legend().should("exist");
      });

      it("should render legend title", () => {
        legendTitle().should("contain", "Channel");
      });

      it("should render correct values", () => {
        assertLegendRowsInOrder("en", "it", "fr", "ru", "es");
      });

      describe("Legend reflects split sort", () => {
        beforeEach(() => {
          cy.visit(urls.secondSplitSortedByDimension);
        });

        it("should show only labels based on channel sort", () => {
          assertLegendRowsInOrder("ar", "be", "bg", "ca", "ce");
        });
      });

      describe("Legend reflects filters", () => {
        beforeEach(() => {
          cy.visit(urls.secondSplitDimensionFiltered);
        });

        it("should show only filtered values", () => {
          assertLegendRowsInOrder("ja", "vi", "pt");
        });
      });
    });

    describe("Series charts", () => {
      beforeEach(() => {
        cy.visit(urls.groupedBySeries);
      });

      it("should render legend", () => {
        legend().should("exist");
      });

      it("should render legend title", () => {
        legendTitle().should("contain", "Series");
      });

      it("should render correct values", () => {
        assertLegendRowsInOrder("Added", "Rows");
      });
    });
  });
});
