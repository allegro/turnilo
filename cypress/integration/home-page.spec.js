/// <reference types="Cypress" />

context('Home Page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:9090');
  });

  it('should load wikipedia cube', () => {
    cy.get('.cube-header-bar .title')
      .should('contain', 'Wikipedia Example');
  });

  it('should load Totals visualisation', () => {
    cy.get('.base-visualization')
      .should('have.class', 'totals');
  });

  it('should set Latest day time filter', () => {
    cy.get('.filter-tile .filter')
      .should('have.length', 1)
      .should('contain', 'Latest day');
  });

  it('should set default series "Added"', () => {
    cy.get('.series-tile .series')
      .should('have.length', 1)
      .should('contain', 'Added');
  });

  it('should load data for defined filters and measures', async () => {
    const total = await cy.get('.visualization .total');
    const name = total.find('.measure-name');
    const value = total.find('.measure-value');
    expect(name).to.have.text('Added');
    expect(value).to.have.text('9.4 m');
  });
});
