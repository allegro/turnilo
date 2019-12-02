/// <reference types="Cypress" />

context('Split Tile', () => {
  describe("No splits in View Definition", () => {
    beforeEach(() => {
      cy.visit('http://localhost:9090');
    });

    it('should load with no splits', () => {
      cy.get('.split-tile .items')
        .should('be.empty');
    });

    it('should add Channel split with plus button', () => {
      // Open Add Tile modal
      cy.get('.split-tile .add-tile').click();
      // Select first option
      cy.get('.add-tile-menu .tile-row .label:contains("Channel")').click();

      cy.get('.split-tile .items .split.dimension')
        .should('have.length', 1)
        .should('contain', 'Channel');
    });

    it('should add Channel split with plus button using search field', () => {
      // Open Add Tile modal
      cy.get('.split-tile .add-tile').click();
      // Type into search box
      cy.get('.add-tile-menu').within(() => {
        cy.get('.search-box input').type('Channel');
        cy.get('.tile-row .label')
          .should('have.length', 1)
          .should('contain', "Channel")
          .click();
      });

      cy.get('.split-tile .items .split.dimension')
        .should('have.length', 1)
        .should('contain', 'Channel');
    });

    it('should add Channel split with dimension action', () => {
      // Open Dimension Actions menu
      cy.get('.dimension-list-tile .dimension .label:contains("Channel")').click();
      // Select Add Split action
      cy.get('.dimension-actions-menu .subsplit.action').click();

      cy.get('.split-tile .items .split.dimension')
        .should('have.length', 1)
        .should('contain', 'Channel');
    });

    it.only('should add Channel split with dimension action using search field', () => {
      cy.get('.dimension-list-tile').within(() => {
        // Focus Dimension search box
        cy.get('.icon.search').click();
        cy.get('.search-box input').type('Channel');
        cy.get('.rows .dimension')
          .should('have.length', 1)
          .should('contain', "Channel")
          .click();
      });
      // Select Add Split action
      cy.get('.dimension-actions-menu .subsplit.action').click();

      cy.get('.split-tile .items .split.dimension')
        .should('have.length', 1)
        .should('contain', 'Channel');
    });
  });

  describe("Channel split already in View Definition", () => {
    beforeEach(() => {
      cy.visit('http://localhost:9090/#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhpwBGCApiADSEQC2ZyOFBAomgMYD0AqgCoDCVEADMICNGQBOUfAG1QaAJ4AHZjXpDJZYfnUVqGegAUpWACYy88kGZiT0WXASMBGACJCoE5fgC0LgxU1BHQyLxAAXwBdaOooZSQ0S2slVV0vSQhsAHMhMzoybChHXXYACzhsbDIET0xJNHxQLR0CODMzMjMhVLUoUzC8iC12DBxdTqh2QvycoVVMzG6CSOokWghGvABWAAZYkH7Mwatm7SlC6d12zu7qYXradCbCIIntOBhxITBEGDVVq80gR6HBYFpIlFqMostUzG4CkVHMkQOVKtVatRsHB6PE4FdqNAAEqYYiYRpQkAwqpdADK9S2IBuXSE5GyM3w2C+CGoZQg2TKSAFWy5CAQESAA==');
    });

    it('should load with time split', () => {
      cy.get('.split-tile .items .split.dimension')
        .should('have.length', 1)
        .should('contain', 'Channel');
    });

    it('Channel should not be available in add split list', () => {
      // Open Add Tile modal
      cy.get('.split-tile .add-tile').click();

      cy.get('.add-tile-menu .tile-row:contains("Channel")')
        .should("not.exist");
    });

    it('should add split with plus button', () => {
      // Open Add Tile modal
      cy.get('.split-tile .add-tile').click();

      // Select Page dimension
      cy.get('.add-tile-menu .tile-row:contains("Page")').click();

      cy.get('.split-tile .items').within(() => {
        cy.get('.split.dimension')
          .should('have.length', 2);

        cy.get('.split.dimension:first')
          .should('contain', 'Channel');

        cy.get('.split.dimension:nth-child(2)')
          .should('contain', 'Page');
      });
    });

    it('Channel dimension should not have Add split action', () => {
      // Open Dimension Actions menu
      cy.get('.dimension-list-tile .dimension .label:contains("Channel")').click();

      cy.get('.dimension-actions-menu .subsplit.action').as('add-split');

      cy.get('@add-split')
        .should('have.class', 'disabled');

      // Nothing happens
      cy.get('@add-split').click();

      cy.get('.split-tile .items .split.dimension')
        .should('have.length', 1)
        .should('contain', 'Channel');
    });

    it('should add split with dimension action', () => {
      // Open Dimension Actions menu
      cy.get('.dimension-list-tile .dimension .label:contains("Page")').click();
      // Select Add Split action
      cy.get('.dimension-actions-menu .subsplit.action').click();

      cy.get('.split-tile .items').within(() => {
        cy.get('.split.dimension')
          .should('have.length', 2);

        cy.get('.split.dimension:first')
          .should('contain', 'Channel');

        cy.get('.split.dimension:nth-child(2)')
          .should('contain', 'Page');
      });
    });

    it('should replace split with dimension action', () => {
      // Open Dimension Actions menu
      cy.get('.dimension-list-tile .dimension .label:contains("Page")').click();
      // Select Replace Split action
      cy.get('.dimension-actions-menu .split.action').click();

      cy.get('.split-tile .items .split.dimension')
        .should('have.length', 1)
        .should('contain', 'Page');
    });
  });
});
