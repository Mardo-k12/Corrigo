// cypress/support/commands.ts - Custom Cypress commands

Cypress.Commands.add("login", (email: string, password: string) => {
  cy.visit("/login");
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should("include", "/dashboard");
});

Cypress.Commands.add("uploadImage", (filePath: string) => {
  cy.get('input[type="file"]').selectFile(filePath);
  cy.get("button").contains(/Upload|Submit/i).click();
});

Cypress.Commands.add("checkRequestId", () => {
  cy.request("GET", "http://localhost:5001/health").then((response) => {
    expect(response.body).to.have.property("requestId");
    expect(response.body.requestId).to.match(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
  });
});

declare namespace Cypress {
  interface Chainable {
    login(email: string, password: string): Chainable<void>;
    uploadImage(filePath: string): Chainable<void>;
    checkRequestId(): Chainable<void>;
  }
}
