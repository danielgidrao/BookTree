/// <reference types="cypress" />

describe('Visita e clica em ver detalhes', () => {
  it('Clica em ver detalhes', () => {
    cy.visit('http://localhost:5173')

    cy.contains('Ver Detalhes').click()
  })
})

describe('Visita e testa hamlet', () => {
  it('Clica em ver detalhes', () => {
    cy.visit('http://localhost:5173')

    cy.get('input#titulo').type('hamlet') //input com id titulo

    cy.get('input#titulo').should('have.value', 'hamlet')

    cy.wait(600)

    cy.contains('h3', 'Hamlet').should('be.visible').closest('div[id]').should('have.attr', 'id', '9788501084125')
  })
})

describe('Visita e testa o campo de autor pelo placeholder', () => {
  it('Clica em ver detalhes', () => {
    cy.visit('http://localhost:5173')

    cy.get('input[placeholder="Digite o autor..."]').type('William Shakespeare').should('have.value', 'William Shakespeare')

    cy.wait(500)

    cy.contains('h4', 'William Shakespeare').should('be.visible')
  })
})