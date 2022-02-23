
context("Scatterplot", () => {
    const URL = "http://localhost:9090/#2016-rio/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhQDG6aApgE4AOCmaIANONPEqhjgMplobYDmUfNhgIETDAFsyyHGXwgAomiIB6AKoAVAMKMQAMwgJyFIXgDaoNAE8q8glPlMKZfQoD67x3scAFSlgAJmaWIIEwFOhYuAS+AIwAsnpQ5FT4ALRxErb2IAjoZCkgAL4AumVMUDQQaCFWOQopFBACeoEQ0thQ0QrYUTiINdbJmBT0eKAubgT8mAiBPg0EUAGFbRAuRBwxYYVEZNjtrUx2zZgLBCVMSJI1+ACsAAwVhKt1IFOUB/sKs/N6+lGknQ+HqdgUgVccFE9CYYEQMFyVxANnBBGkcFgLiuk1cX2wP2WRjAlABQJBExRS12+mhxj08IQiIUyNRuQxWPkLyoLWwZECABEOgdujgQq8AB7JKijeilE68/mcWW/OYLYpAA==="
    const scatterplot = () => cy.get(".scatterplot");
    const points = () => scatterplot().find(".point");
    const yAxisTitle = () => scatterplot().find(".axis-title-y");
    const xAxisTitle = () => scatterplot().find(".axis-title-x");
    const xAxis = () => scatterplot().find(".axis-x");
    const yAxis = () => scatterplot().find(".axis-y");
    const gridLines = () => scatterplot().find(".grid-lines");
    const firstHoverableArea = () => scatterplot().find("circle:not(.point):first")
    const tooltip = () => scatterplot().find(".tooltip-within-stage");

    beforeEach(() => {
        cy.visit(URL);
    });

    it('should render', () => {
        scatterplot().should("exist");
    })

    it("should render 50 points", () => {
        points().should("have.length", 50);
    });

    it("should render Y axis title", () => {
        yAxisTitle().should("have.text", "Silver medals");
    });

    it("should render X axis title", () => {
        xAxisTitle().should("have.text", "Gold medals");
    });

    it("should render horizontal and vertical grid lines", () => {
        gridLines().should("have.length", 2);
    });

    it("should load 2 ticks on X axis", () => {
        xAxis().find(".tick").should("have.length", 2);
    });

    it("should load 2 ticks on Y axis", () => {
        yAxis().find(".tick").should("have.length", 2);
    });

    it('should render tooltip on point hover', () => {
        firstHoverableArea().trigger('mouseover');

        tooltip().should("exist");
    })
})

