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
context("Scatterplot", () => {
    const urls = {
        // tslint:disable:max-line-length
        defaultView: "http://localhost:9090/#2016-rio/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhQDG6aApgE4AOCmaIANONPEqhjgMplobYDmUfNhgIETDAFsyyHGXwgAomiIB6AKoAVAMKMQAMwgJyFIXgDaoNAE8q8glPlMKZfQoD67x3scAFSlgAJmaWIIEwFOhYuAS+AIwAsnpQ5FT4ALRxErb2IAjoZCkgAL4AumVMUDQQaCFWOQopFBACeoEQ0thQ0QrYUTiINdbJmBT0eKAubgT8mAiBPg0EUAGFbRAuRBwxYYVEZNjtrUx2zZgLBCVMSJI1+ACsAAwVhKt1IFOUB/sKs/N6+lGknQ+HqdgUgVccFE9CYYEQMFyVxANnBBGkcFgLiuk1cX2wP2WRjAlABQJBExRS12+mhxj08IQiIUyNRuQxWPkLyoLWwZECABEOgdujgQq8AB7JKijeilE68/mcWW/OYLYpAA===",
        withSummary: "http://localhost:9090/#2016-rio/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhQDG6aApgE4AOCmaIANONPEqhjgMplobYDmUfKCgALTAHdOMALYy4FAJ740FGGQC+TDDLLIcZfCACiaIgHoAqgBUAwoxAAzCAnIUheANqg0iqoYIdQyYKMkcjAH0IoIcggAVKLAATD28QJJgKdCxcAjiARgBZByhyKnwAWnztPwCQBHQyUpANAF02pigaCDRUn1qjUooIAQckiF1sKByjbGycRB7lTswKejxQUPCCfkwEJNiBgihEprGIUKIOXPSmojJscdGmf2HMA4IWpiQZHvwAJgArB1CKc+iAtpQHvcjLt9g5HKt5Ot+v4jEkwnAYK4HGBEOojF8QL40QRdHBYKEvpswlDsDDji4wJQEUj0MJiUdbo4sTimHiEATPlpOaSQOTKYYQVQRtgyEkACITB7THCpUEADxKVFW9FaL1l8s4uthewOGiAA==="
        // tslint:enable:max-line-length
    };
    const scatterplot = () => cy.get(".scatterplot");
    const points = () => scatterplot().find(".point");
    const yAxisTitle = () => scatterplot().find(".axis-title-y");
    const xAxisTitle = () => scatterplot().find(".axis-title-x");
    const xAxis = () => scatterplot().find(".axis-x");
    const yAxis = () => scatterplot().find(".axis-y");
    const gridLines = () => scatterplot().find(".grid-lines");
    const firstHoverableArea = () => scatterplot().find("circle:not(.point):first");
    const tooltip = () => scatterplot().find(".tooltip-within-stage");
    // heatmap
    const heatmap = () => scatterplot().find(".heatmap");
    const heatmapLegend = () => cy.get(".color-legend");
    const rectangles = () => scatterplot().find("rect");

    describe("Default properties", () => {
        beforeEach(() => {
            cy.visit(urls.defaultView);
        });

        it("should render", () => {
            scatterplot().should("exist");
        });

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

        it("should render tooltip on point hover", () => {
            firstHoverableArea().trigger("mouseover");

            tooltip().should("exist");
        });
    });

    describe("Heatmap summary", () => {
        beforeEach(() => {
            cy.visit(urls.withSummary);
        });

        it("should render heatmap", () => {
            heatmap().should("exist");
        });

        it("should render legend", () => {
            heatmapLegend().should("exist");
        });

        it("should render rectangles", () => {
            rectangles().should("have.length", 154);
        });
    });

    describe("Large screen", () => {
        beforeEach(() => {
            cy.visit(urls.defaultView);
            cy.viewport(1920, 1064);
        });

        it("should load ticks on X axis", () => {
            xAxis().find(".tick").should("have.length", 15);
        });

        it("should load ticks on Y axis", () => {
            yAxis().find(".tick").should("have.length", 12);
        });
    });

    describe("Small screen", () => {
        beforeEach(() => {
            cy.visit(urls.defaultView);
            cy.viewport(1024, 920);
        });

        it("should load ticks on X axis", () => {
            xAxis().find(".tick").should("have.length", 8);
        });

        it("should load ticks on Y axis", () => {
            yAxis().find(".tick").should("have.length", 6);
        });
    });
});
