import "./commands";

// Disable uncaught exception handler for external errors
Cypress.on("uncaught:exception", (err, runnable) => {
  // Return false to prevent Cypress from failing the test
  return false;
});

// Before each test
beforeEach(() => {
  // Clear localStorage
  cy.window().then((win) => {
    win.localStorage.clear();
  });
});
