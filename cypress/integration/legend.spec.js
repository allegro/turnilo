context("Line Chart Legend", () => {

  const legend = () => cy.get(".line-chart-legend");
  const legendTitle = () => legend().find(".legend-header");
  const legendValues = () => legend().find(".legend-value");
  const legendValue = (idx) => legend().find(`.legend-value:nth-child(${idx})`);

  const urls = {
    baseLineChart: "http://localhost:9090/#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhLYCmAtAMYAWcATmiADTjTxKoY4DKxaG2A5lHzYYCBEwwBbYshzF8IAKJpyAegCqAFQDCjEADMICNMRpC8AbVBoAngAd5BKfKY1i+hc73OACqawAJuZWIAEwNOhYuAQ+AIwAInpQJnb4pLES9o6E6MTJIAC+ALrFTFB2SGjB1lkKyTQQAnoBENLYUFEKVHDYJAhJmHT4oG4eBHABAcQB3rUEUP55zRBu5BzRoXnkxNgtTUwODZgzBIVMSJIQ9HgArAUMNQ6erS6hL+2dTi96/BEiCLQrjYFD5NLEABIDIZ4EbuZ7SWZPAgtNodHDLVbrBRwKDbXaNfhnQitK7CUQIUogBYNJaWWH6Uw7bbYybTPT6QaSdDDEC2JGbfRwUT0JhgRAwbJEvnZaQ48LySl2RokALxd5o9r4Cwgbq9Yj9JjYODScpwZlMaAAJUwACNMPQigdldNOINriAJlMZgUgA=",
    exactFormat: "http://localhost:9090/#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhLYCmAtAMYAWcATmiADTjTxKoY4DKxaG2A5lHzYYCBEwwBbYshzF8IAKJpyAegCqAFQDCjEADMICNMRpC8AbVBoAngAd5BKfKY1i+hc73OACqawAJuZWIAEwNOhYuAQ+AIwAInpQJnb4pLES9o6E6MTJIAC+ALrFTFB2SGjB1lkKyTQQAnoBENLYUFEKVHDYJAhJmHT4oG4eBHABAcQB3rUEUP55zRBu5BzRoXnkxNgtTUwODZgzBIVMSJIQ9HgArAUMNQ6erS6hL+2dTi96/BEiCLQrjYFD5NLEABIDIZ4EbuZ7SWZPAgtNodHDLVbrBRwKDbXaNfhnQitK7CUQIUogBYNJaWWH6Uw7bbYybTPT6QaSdDDEC2JEgYgADzgaz0YEQMGyRL52WkOPC8kpdkaJAC8XeaPa+AsIG6vWI/SY2Dg0nKIte0AASpgAEaYehFA4q6acQbXEATKYzApAA=",
    channelSort: "http://localhost:9090/#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhLYCmAtAMYAWcATmiADTjTxKoY4DKxaG2A5lHzYYCBEwwBbYshzF8IAKJpyAegCqAFQDCjEADMICNMRpC8AbVBoAngAd5BKfKY1i+hc73OACqawAJuZWIAEwNOhYuAQ+AIwAInpQJnb4pLES9o6E6MTJIAC+ALrFTFB2SGjB1lkKyTQQAnoBENLYUFEKVHDYJAhJmHT4oG4eBN29xP2ZDgotbR04zRBu5BzRIHBQ5MTYLU0FTEiSEPR4AKyHNbNOrS6hd+2dt9J6/BEiCLSnNgo+mrEABIDIZ4EbuTx3by1AjzXaLXBMFqrdYKLY7PaNfiFI6tU7CUQIUogKD+PL4EKjUy7HZogIBYgBPT6QaSdDDEC2G4gYgADzgaz0YEQMGyOM5MJA0i24XkxLsjRIAXijwRwRAEz6emwcGk5QF92gACVMAAjTD0IpMBWTAKcQZnTb0xmFIA",
    filteredValues: "http://localhost:9090/#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhLYCmAtAMYAWcATmiADTjTxKoY4DKxaG2A5lHzYYCBEwwBbYshzF8IAKJpyAegCqAFQDCjEADMICNMRpC8AbVBoAngAd5BKfKY1i+hc73OACqawAJuZWIAEwNOhYuAQ+AIwAInpQJnb4pLES9o6E6MTJIAC+ALoFDNZZCsk0EAJ6bh4EVHDYJAh6cOQc0SA1emCIMHn4FiAAVnB9EHp29EVM2Jj0ePqIUMTFTFB2SGjB5Q6VaNW1TAEQ0thQUQpNLcRtm5h0+KD1CnABAcQB3hUEa9UhqcIG5OtcCF8oORiNgzicQA5qpgfgRCkwkJIIEsAKylfbZLzAi5XHCec4uED8CIiBC0LE2BQ+TSxAASSSeS1e7jJ0l+Bwh5Mu12BoK67yhMLh/DRhHOWOEogQGxAAIgQ0sXP0phh0Pen2+en0T0k6BeIFs/NC7jgonoTH6CEGChlFuy0jgsDchTmCJqJAC8UFJMuwxAt1aemwcGkWw6FOgACVMAAjRYgH12P3fTgcvVfH4FIA==",
  };

  function assertLegendValues(...values) {
    const rows = legendValues();
    rows.should("have.length", values.length);

    values.forEach(({label, value}, idx) => {
      // Need to call legendValue separately - find mutates source object.
      legendValue(idx + 1).find(".legend-value-name").should("contain", label);
      if (value !== undefined) {
        legendValue(idx + 1).find(".legend-value-measure").should("contain", value);
      } else {
        legendValue(idx + 1).find(".legend-value-measure").should("not.exist");
      }
    });
  }

  describe("Legend render", () => {
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
      assertLegendValues(
        {label: "en", value: "3.0 m"},
        {label: "it", value: "711.0 k"},
        {label: "fr", value: "642.6 k"},
        {label: "ru", value: "640.7 k"},
        {label: "es", value: "634.7 k"},
      );
    });
  });

  describe("Legend reflects series formatting", () => {
    beforeEach(() => {
      cy.visit(urls.exactFormat);
    });

    it("should format values with series formatter", () => {
      assertLegendValues(
        {label: "en", value: "3,045,299"},
        {label: "it", value: "711,011"},
        {label: "fr", value: "642,555"},
        {label: "ru", value: "640,698"},
        {label: "es", value: "634,670"},
      );
    });
  });

  describe("Legend reflects split sort", () => {
    beforeEach(() => {
      cy.visit(urls.channelSort);
    });

    it("should show only labels based on channel sort", () => {
      assertLegendValues(
        {label: "ar"},
        {label: "be"},
        {label: "bg"},
        {label: "ca"},
        {label: "ce"},
      );
    });
  });

  describe("Legend reflects filters", () => {
    beforeEach(() => {
      cy.visit(urls.filteredValues);
    });

    it("should show only filtered values", () => {
      assertLegendValues(
        {label: "ja", value: "317.2 k"},
        {label: "vi", value: "296.0 k"},
        {label: "pt", value: "229.1 k"},
      );
    });
  });
});
