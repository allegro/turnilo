/// <reference types="Cypress" />

context("String Split Menu", () => {
  const channelTile = () => cy.get(`.split-tile .split.dimension:contains(Channel)`);
  const openChannelMenu = () => channelTile().click();
  const splitMenu = () => cy.get(".split-menu");
  const limitDropdown = () => splitMenu().find(".dropdown.down:nth-child(2)");
  const limitOption = (option) => limitDropdown().find(`.dropdown-item:contains(${option})`);
  const limitSelection = () => limitDropdown().find(".selected-item");
  const sortDirection = () => splitMenu().find(".sort-direction .direction");
  const sortByDropdown = () => splitMenu().find(".sort-direction .dropdown");
  const sortBySelection = () => sortByDropdown().find(".selected-item");
  const sortByOption = (option) => sortByDropdown().find(`.dropdown-item:contains(${option})`);

  const urls = {
    // tslint:disable-next-line:max-line-length
    channelSplit: "http://localhost:9090/#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhpwBGCApiADSEQC2ZyOFBAomgMYD0AqgCoDCVEADMICNGQBOUfAG1QaAJ4AHZjXpDJZYfnUVqGegAUpWACYy88kGZiT0WXASMBGACJCoE5fgC0LgxU1BHQyLxAAXwBdaOooZSQ0S2slVV0vSQhsAHMhMzoybChHXXYACzhsbDIET0xJNHxQLR0CODMzMjMhVLUoUzC8iC12DBxdTqh2QvycoVVMzG6CSOokWghGvABWAAZYkH7Mwatm7SlC6d12zu7qYXradCbCIIntOBhxITBEGDVVq80gR6HBYFpIlFqMostUzG4CkVHMkQOVKtVatRsHB6PE4FdqNAAEqYYiYRpQkAwqpdADK9S2IBuXSE5GyM3w2C+CGoZQg2TKSAFWy5CAQESAA==",
  };

  function assertSplitSettings(orderBy, descending, limit) {
    sortBySelection().should("contain", orderBy);
    sortDirection().should("have.class", descending ? "descending" : "ascending");
    limitSelection().should("contain", limit);
  }

  beforeEach(() => {
    cy.visit(urls.channelSplit);
    openChannelMenu();
  });

  it("should show split menu for string dimension", () => {
    splitMenu().should("exist");
  });

  it("should load split settings", () => {
    assertSplitSettings("Added", true, 50);
  });

  describe("Save action", () => {
    const save = () => splitMenu().find(".button.primary").click();

    it("should update splits limit", () => {
      limitSelection().click();
      limitOption(25).click();

      save();

      openChannelMenu();

      assertSplitSettings("Added", true, 25);
    });

    it("should update splits sort direction", () => {
      sortDirection().click();

      save();

      openChannelMenu();

      assertSplitSettings("Added", false, 50);
    });

    it("should update splits sort by", () => {
      sortBySelection().click();
      sortByOption("Channel").click();

      save();

      openChannelMenu();

      assertSplitSettings("Channel", true, 50);
    });
  });
});
