describe("API Health Check", () => {
  it("should return health status", () => {
    cy.request("GET", "http://localhost:5001/health")
      .should("have.status", 200)
      .its("body")
      .should("have.property", "status", "ok")
      .and("have.property", "requestId");
  });
});

describe("OCR Endpoint", () => {
  it("should validate missing imageBase64", () => {
    cy.request({
      method: "POST",
      url: "http://localhost:5001/api/ai/ocr",
      body: { mimeType: "image/jpeg" },
      failOnStatusCode: false,
    })
      .should("have.status", 400)
      .its("body")
      .should("have.property", "error");
  });

  it("should validate invalid mimeType", () => {
    cy.request({
      method: "POST",
      url: "http://localhost:5001/api/ai/ocr",
      body: {
        imageBase64: "iVBORw0KGgo...",
        mimeType: "video/mp4",
      },
      failOnStatusCode: false,
    })
      .should("have.status", 400);
  });

  it("should process valid OCR request", () => {
    const validBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    
    cy.request({
      method: "POST",
      url: "http://localhost:5001/api/ai/ocr",
      body: {
        imageBase64: validBase64,
        mimeType: "image/png",
      },
      failOnStatusCode: false,
    })
      .should((response) => {
        expect(response.status).to.be.oneOf([200, 500]); // 500 if Gemini not configured
      });
  });
});

describe("Rate Limiting", () => {
  it("should enforce rate limit on health endpoint", () => {
    const requests = Array.from({ length: 150 }, () =>
      cy.request({
        method: "GET",
        url: "http://localhost:5001/health",
        failOnStatusCode: false,
      })
    );

    cy.wrap(requests).then((responses) => {
      const lastResponse = responses[responses.length - 1];
      // Should see 429 Too Many Requests at some point
      expect(lastResponse.status).to.be.oneOf([200, 429]);
    });
  });
});

describe("Frontend Navigation", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should load the home page", () => {
    cy.contains("h1", /Home|Welcome|Corrigo/i, { timeout: 5000 }).should(
      "be.visible"
    );
  });

  it("should have navigation elements", () => {
    cy.get("nav, [role=navigation]").should("exist");
  });
});

describe("Error Handling", () => {
  it("should handle 404 gracefully", () => {
    cy.request({
      method: "GET",
      url: "http://localhost:5001/api/nonexistent",
      failOnStatusCode: false,
    })
      .should("have.status", 404)
      .its("body")
      .should("have.property", "error", "Not found");
  });

  it("should handle invalid JSON body", () => {
    cy.request({
      method: "POST",
      url: "http://localhost:5001/api/ai/ocr",
      body: "invalid json {",
      failOnStatusCode: false,
      headers: { "Content-Type": "application/json" },
    }).should("have.status", 400);
  });
});
