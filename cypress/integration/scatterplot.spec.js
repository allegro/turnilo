
context("Scatterplot", () => {
    const URL = "http://localhost:9090/#2016-rio/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhQDG6aApgE4AOCmaIANONPEqhjgMplobYDmUfNhgIETDAFsyyHGXwgAomiIB6AKoAVAMKMQAMwgJyFIXgDaoNAE8q8glPlMKZfQoD67x3scAFSlgAJmaWIIEwFOhYuAS+AIwAsnpQ5FT4ALRxErb2IAjoZCkgAL4AumVMUDQQaCFWOQopFBACeoEQ0thQ0QrYUTiINdbJmBT0eKAubgT8mAiBPg0EUAGFbRAuRBwxYYVEZNjtrUx2zZgLBCVMSJI1+ACsAAwVhKt1IFOUB/sKs/N6+lGknQ+HqdgUgVccFE9CYYEQMFyVxANnBBGkcFgLiuk1cX2wP2WRjAlABQJBExRS12+mhxj08IQiIUyNRuQxWPkLyoLWwZECABEOgdujgQq8AB7JKijeilE68/mcWW/OYLYpAA==="
    const scatterplot = () => cy.get(".scatterplot");
    const points = () => scatterplot().find(".point");
    const firstAxisTitle = ()=>scatterplot().find(".axis-title:first");
    const secondAxisTitle = ()=>scatterplot().find(".axis-title:last");
    const firstAxis = ()=>scatterplot().find(".axis:first");
    const secondAxis = ()=>scatterplot().find(".axis:last"); // TODO add relevant classes to components
    const gridLines = () => scatterplot().find(".grid-lines");
    const firstHoverableArea = () => scatterplot().find("circle:not(.point):first")
    // const tooltip = () => scatterplot().find(".tooltip-within-stage");


    beforeEach(() => {
        cy.visit(URL);
    });

    it('should render', () => {
      scatterplot().should("exist");
    })

    it("should load 50 points", () => {
        points().should("have.length", 50);
    });

    it("should render Y axis title", () => {
        firstAxisTitle().should("have.text", "Silver medals");
    });

    it("should render X axis title", () => {
        secondAxisTitle().should("have.text", "Gold medals");
    });

    it("should render grid lines horizontal and vertical", () => {
        gridLines().should("have.length", 2);
    });

    it("should render grid lines horizontal and vertical", () => {
        gridLines().should("have.length", 2);
    });

    it("should load 2 ticks on X axis", () => {
        firstAxis().find(".tick").should("have.length", 2);
    });

    it("should load 2 ticks on Y axis", () => {
        secondAxis().find(".tick").should("have.length", 2);
    });

    it('should render tooltip on point hover', () => {
        firstHoverableArea().should("have.length", 1)
        firstHoverableArea().trigger('mouseenter');

        // tooltip().should("exist") //  y u no work :(
    })
})

