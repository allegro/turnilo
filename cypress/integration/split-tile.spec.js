/// <reference types="Cypress" />

context('Split Tile', () => {
  describe('No splits in View Definition', () => {
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

    it('should add Channel split with dimension action using search field', () => {
      cy.get('.dimension-list-tile').within(() => {
        // Focus Dimension search box
        cy.get('.icon.search').click();
        cy.get('.search-box input').type('Channel');
        cy.get('.rows .dimension')
          .should('have.length', 1)
          .should('contain', 'Channel')
          .click();
      });
      // Select Add Split action
      cy.get('.dimension-actions-menu .subsplit.action').click();

      cy.get('.split-tile .items .split.dimension')
        .should('have.length', 1)
        .should('contain', 'Channel');
    });
  });

  describe('Channel split already in View Definition', () => {
    beforeEach(() => {
      cy.visit('http://localhost:9090/#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhpwBGCApiADSEQC2ZyOFBAomgMYD0AqgCoDCVEADMICNGQBOUfAG1QaAJ4AHZjXpDJZYfnUVqGegAUpWACYy88kGZiT0WXASMBGACJCoE5fgC0LgxU1BHQyLxAAXwBdaOooZSQ0S2slVV0vSQhsAHMhMzoybChHXXYACzhsbDIET0xJNHxQLR0CODMzMjMhVLUoUzC8iC12DBxdTqh2QvycoVVMzG6CSOokWghGvABWAAZYkH7Mwatm7SlC6d12zu7qYXradCbCIIntOBhxITBEGDVVq80gR6HBYFpIlFqMostUzG4CkVHMkQOVKtVatRsHB6PE4FdqNAAEqYYiYRpQkAwqpdADK9S2IBuXSE5GyM3w2C+CGoZQg2TKSAFWy5CAQESAA==');
    });

    it('should load with channel split', () => {
      cy.get('.split-tile .items .split.dimension')
        .should('have.length', 1)
        .should('contain', 'Channel');
    });

    it('Channel should not be available in add split list', () => {
      // Open Add Tile modal
      cy.get('.split-tile .add-tile').click();

      cy.get('.add-tile-menu .tile-row:contains("Channel")')
        .should('not.exist');
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

  describe('Three splits already in View Definition', () => {
    beforeEach(() => {
      // Force viewport that shows overflows for three tiles
      cy.viewport(1200, 800);
      cy.visit('http://localhost:9090/#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhpwBGCApiADSEQC2ZyOFBAomgMYD0AqgCoDCVEADMICNGQBOUfAG1QaAJ4AHZjXpDJZYfnUVqGegAUpWACYy88kGZiT0WXASMBGACJCoE5fgC0LgxU1BHQyLxAAXwBdaOooZSQ0S2slVV0vSQhsAHMhMzoybChHXXYACzhsbDIET0xJNHxQLR0CODMzMjMhVLUoUzC8iC12DBxdTqh2QvycoVVMzG6CSOokWghGvABWAAYIygUg9LRMuep8+iKSgmU4bP0QKHqt5u1dds7uwLSCfszBhdhmRRjcbGFpthZrlqAtzLpViB1pt8NsDkdfk9TlkYTYCtdxgR2JtFAA5OAaOIvJogFofDpdHrHP4DGRAkZjJzgqYzHHzUxLBEHJF0FE7WJPVlyN7CKSFab0r5CYT1WjoGm9CbaOAwcRCMCIGBqRGagj0OCwLSRKKwrLVMxufHFHDJEDlSrVWrUbAUsJ3BXUaAAJUwxEwjRtIGUdq6AGVqW0Gd8kWQHlD8NhdQhqGUINkykh81tMwgEBEgA');
    });

    it('should load with two split tiles', () => {
      cy.get('.split-tile .items .split.dimension')
        .should('have.length', 2);
    });

    it('should show overflow tile for third split', () => {
      cy.get('.split-tile .items .dimension.overflow')
        .should('contain', '+1');
    });

    it('should show overflowed split after clicking tile', () => {
      cy.get('.split-tile .items .dimension.overflow')
        .click();

      cy.get('.overflow-menu .split.dimension')
        .should('contain', 'City Name');
    });

    it('should open split menu inside overflow tile', () => {
      cy.get('.split-tile .items .dimension.overflow')
        .click();

      cy.get('.overflow-menu .split.dimension')
        .click();

      cy.get('.split-menu').should('exist');
    });
  });

  describe('Remove action', () => {
    beforeEach(() => {
      cy.visit('http://localhost:9090/#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhpwBGCApiADSEQC2ZyOFBAomgMYD0AqgCoDCVEADMICNGQBOUfAG1QaAJ4AHZjXpDJZYfnUVqGegAUpWACYy88kGZiT0WXASMBGACJCoE5fgC0LgxU1BHQyLxAAXwBdaOooZSQ0S2slVV0vSQhsAHMhMzoybChHXXYACzhsbDIET0xJNHxQLR0CODMzMjMhVLUoUzC8iC12DBxdTqh2QvycoVVMzG6CSOokWghGvABWAAYIygUg9LRMuep8+iKSgmU4bP0QKHqt5u1dds7uwLSCfszBhdhmRRjcbGFpthZrlqAtzLpViB1pt8NsDkdfk9TlkYTYCtdxgR2JtFAA5OAaOIvJogFofDpdHrHP4DGRAkZjJzgqYzHHzUxLBEHJF0FE7WJPVlyN7CKSFab0r5CYT1WjoGm9CbaOAwcRCMCIGBqRGagj0OCwLSRKKwrLVMxufHFHDJEDlSrVWrUbAUsJ3BXUaAAJUwxEwjRtIGUdq6AGVqW0Gd8kWQHlD8NhdQhqGUINkykh81tMwgEBEgA');
    });

    it('should remove split after clicking "x" icon', () => {
      cy.get('.split-tile .items').within(() => {
        cy.get('.split.dimension:contains("Page") .remove').click();

        cy.get('.split.dimension')
          .should('have.length', 2);

        cy.get('.split.dimension:first')
          .should('contain', 'Channel');

        cy.get('.split.dimension:nth-child(2)')
          .should('contain', 'City Name');
      });
    });
  });

  describe('Split menu', () => {
    beforeEach(() => {
      cy.visit('http://localhost:9090/#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhpwBGCApiADSEQC2ZyOFBAomgMYD0AqgCoDCVEADMICNGQBOUfAG1QaAJ4AHZjXpDJZYfnUVqGegAUpWACYy88kGZiT0WXASMBGACJCoE5fgC0LgxU1BHQyLxAAXwBdaOooZSQ0S2slVV0vSQhsAHMhMzoybChHXXYACzhsbDIET0xJNHxQLR0CODMzMjMhVLUoUzC8iC12DBxdTqh2QvycoVVMzG6CSOokWghGvABWAAYIygUg3UN9GwKikoJToWz7bBgQzKVdI14XAAk6hqaQFpOCj1jgR8vRLuNqPkRmMnCA4FMZllcgcQOtNvgHggEAcjmkCA9aMQpEMwcVxgR2JhaGC0AAZQrZNBlW73R5wZ6KfAuXZxepbZraXTtTrdQJ4kD9TKDSHDMijK42MLTbCzXLUBbmXSrVF0dE7WISgbJAXCKSFaZCjpdITCeq0dC/XoTbRwR6NahgRAwNTap0EejwuwUA3KLLVMxuC5kopyEDlSrVWrUbBwejxOAW6jQABKmGImEaUXVYa6AGU+ZaRUJyNkZhjHghqGUINkykhW1tMdigA==');
    });


    it('split menu has action buttons', () => {
      cy.get('.split.dimension:contains("Channel")').click();

      cy.get('.button-bar .primary').should('contain', 'OK');
      cy.get('.button-bar .secondary').should('contain', 'Cancel');
    });

    it('split menu OK action should be disabled upon menu opening', () => {
      cy.get('.split.dimension:contains("Channel")').click();

      cy.get('.button-bar .primary').should('have.attr', 'disabled');
    });

    it('split menu OK action should be enabled after changing split options', () => {
      cy.get('.split.dimension:contains("Channel")').click();

      cy.get('.sort-direction .direction').click();

      cy.get('.button-bar .primary').should('not.have.attr', 'disabled');
    });

    describe('String Split menu', () => {
      it('should show split menu for string dimension', () => {
        cy.get('.split.dimension:contains("Channel")').click();

        cy.get('.split-menu').should('exist');
      });

      it('string split menu has sort controls', () => {
        cy.get('.split.dimension:contains("Channel")').click();

        cy.get('.split-menu .sort-direction').within(() => {
          cy.get('.direction').should('have.class', 'descending');
          cy.get('.dropdown-label').should('contain', 'Sort by');
          cy.get('.dropdown .selected-item').should('contain', 'Added');
        });
      });

      it('string split menu has limit controls', () => {
        cy.get('.split.dimension:contains("Channel")').click();

        cy.get('.split-menu > .dropdown.down').within(() => {
          cy.get('.dropdown-label').should('contain', 'Limit');
          cy.get('.selected-item').should('contain', '50');
        });
      });
    });

    describe('Time Split menu', () => {
      it('should show split menu for time dimension', () => {
        cy.get('.split.dimension:contains("Time")').click();

        cy.get('.split-menu').should('exist');
      });

      it('time split menu has granularity controls', () => {
        cy.get('.split.dimension:contains("Time")').click();

        cy.get('.split-menu .button-group').within(() => {
          cy.get('.button-group-title').should('contain', 'Granularity');
          cy.get('.group-container .group-member').should('have.length', 6);
          cy.get('.group-container .group-member.selected').should('exist');
          cy.get('.group-container .group-member:last').should('contain', '…');
        });
      });

      it('granularity "…" option show input box', () => {
        cy.get('.split.dimension:contains("Time")').click();

        cy.get('.split-menu .button-group .group-member:last').click();

        cy.get('.split-menu .custom-input')
          .should('have.class', 'invalid')
          .should('have.value', '')
          .should('have.attr', 'placeholder', 'e.g. PT2H or P3M')
      });

      it('time split menu has sort controls', () => {
        cy.get('.split.dimension:contains("Time")').click();

        cy.get('.split-menu .sort-direction').within(() => {
          cy.get('.direction').should('have.class', 'ascending');
          cy.get('.dropdown-label').should('contain', 'Sort by');
          cy.get('.dropdown .selected-item').should('contain', 'Time');
        });
      });

      it('time split menu has limit controls', () => {
        cy.get('.split.dimension:contains("Time")').click();

        cy.get('.split-menu > .dropdown.down').within(() => {
          cy.get('.dropdown-label').should('contain', 'Limit');
          cy.get('.selected-item').should('contain', 'None');
        });
      });
    });

    describe('Number Split menu', () => {
      it('should show split menu for number dimension', () => {
        cy.get('.split.dimension:contains("Comment")').click();

        cy.get('.split-menu').should('exist');
      });

      it('number split menu has granularity controls', () => {
        cy.get('.split.dimension:contains("Comment")').click();

        cy.get('.split-menu .button-group').within(() => {
          cy.get('.button-group-title').should('contain', 'Granularity');
          cy.get('.group-container .group-member').should('have.length', 6);
          cy.get('.group-container .group-member.selected').should('exist');
          cy.get('.group-container .group-member:last').should('contain', '…');
        });
      });

      it('granularity "…" option show input box', () => {
        cy.get('.split.dimension:contains("Comment")').click();

        cy.get('.split-menu .button-group .group-member:last').click();

        cy.get('.split-menu .custom-input')
          .should('have.class', 'invalid')
          .should('have.value', '')
          .should('have.attr', 'placeholder', 'Bucket size')
      });

      it('number split menu has sort controls', () => {
        cy.get('.split.dimension:contains("Comment")').click();

        cy.get('.split-menu .sort-direction').within(() => {
          cy.get('.direction').should('have.class', 'descending');
          cy.get('.dropdown-label').should('contain', 'Sort by');
          cy.get('.dropdown .selected-item').should('contain', 'Added');
        });
      });

      it('number split menu has limit controls', () => {
        cy.get('.split.dimension:contains("Comment")').click();

        cy.get('.split-menu > .dropdown.down').within(() => {
          cy.get('.dropdown-label').should('contain', 'Limit');
          cy.get('.selected-item').should('contain', 5);
        });
      });
    });
  });
});
