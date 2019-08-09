/// <reference types="Cypress" />

context('Home Page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:9090');
  });

  it('test', () => {

    cy.get('.total .measure-value')
      .should("have.length", 1)
      .should('contain', '9.4 m');
  })
});
