/// <reference types="cypress" />

import { testFixtures } from "@workspace/db";

describe("Integration Tests - Complete Workflows", () => {
  const fixtures = testFixtures;
  const API_URL = "http://localhost:5001";

  beforeEach(() => {
    // Clear authentication state
    localStorage.clear();
    sessionStorage.clear();
  });

  describe("Teacher Workflow - Create & Grade Exam", () => {
    it("should complete full exam creation and grading workflow", () => {
      // 1. Login as teacher
      cy.visit("http://localhost:5173");
      cy.get('input[type="email"]').type(fixtures.users.teacher.email);
      cy.get('input[type="password"]').type(fixtures.users.teacher.password);
      cy.get('button[type="submit"]').click();

      // Wait for redirect to dashboard
      cy.url().should("include", "/dashboard");

      // 2. Create course
      cy.get("button").contains("New Course").click();
      cy.get('input[placeholder="Course Name"]').type(
        fixtures.courses.math101.name
      );
      cy.get('input[placeholder="Course Code"]').type(
        fixtures.courses.math101.code
      );
      cy.get("button").contains("Create").click();

      // Verify course created
      cy.get("main").should("contain", fixtures.courses.math101.name);

      // 3. Create exam
      cy.get("button").contains("New Exam").click();
      cy.get('input[placeholder="Exam Title"]').type(fixtures.exams.midterm.title);
      cy.get('input[placeholder="Total Points"]').type("100");
      cy.get("button").contains("Create").click();

      // 4. Verify exam in list
      cy.get("main").should("contain", fixtures.exams.midterm.title);
    });

    it("should handle exam grading flow with rate limiting", () => {
      // Make multiple grade requests to test rate limiting
      const requests = Array.from({ length: 5 }, (_, i) => ({
        examId: `exam-${i}`,
        studentAnswer: "test-answer",
      }));

      requests.forEach((req) => {
        cy.request({
          method: "POST",
          url: `${API_URL}/api/ai/grade`,
          body: {
            examId: req.examId,
            studentAnswer: req.studentAnswer,
          },
          failOnStatusCode: false,
        }).then((response) => {
          // Should succeed or hit rate limit gracefully
          expect([200, 429]).to.include(response.status);
        });
      });
    });
  });

  describe("Data Integrity - Pagination & Filtering", () => {
    it("should paginate courses correctly", () => {
      cy.request({
        method: "GET",
        url: `${API_URL}/api/courses?page=1&limit=10`,
      })
        .should("have.status", 200)
        .its("body")
        .should("have.all.keys", [
          "data",
          "pagination",
        ])
        .its("pagination")
        .should("have.all.keys", [
          "page",
          "limit",
          "total",
          "totalPages",
          "hasMore",
        ]);
    });

    it("should filter exams by course", () => {
      cy.request({
        method: "GET",
        url: `${API_URL}/api/exams?courseId=course-1&page=1&limit=20`,
      })
        .should("have.status", 200)
        .its("body.data")
        .should("be.an", "array");
    });

    it("should enforce maximum page limit", () => {
      cy.request({
        method: "GET",
        url: `${API_URL}/api/courses?page=1&limit=500`,
        failOnStatusCode: false,
      }).then((response) => {
        // Should either cap at 100 or return error
        if (response.status === 200) {
          expect(response.body.pagination.limit).to.be.lte(100);
        } else {
          expect(response.status).to.equal(400);
        }
      });
    });
  });

  describe("Error Handling & Edge Cases", () => {
    it("should return 400 for invalid exam grade request", () => {
      cy.request({
        method: "POST",
        url: `${API_URL}/api/ai/grade`,
        body: {
          // Missing required fields
          examId: "exam-1",
        },
        failOnStatusCode: false,
      }).should("have.status", 400);
    });

    it("should return 404 for non-existent exam", () => {
      cy.request({
        method: "GET",
        url: `${API_URL}/api/exams/non-existent`,
        failOnStatusCode: false,
      }).should("have.status", 404);
    });

    it("should handle malformed JSON gracefully", () => {
      cy.request({
        method: "POST",
        url: `${API_URL}/api/ai/ocr`,
        headers: {
          "Content-Type": "application/json",
        },
        body: "{invalid json}",
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property("error");
      });
    });

    it("should include request ID in all responses", () => {
      cy.request("GET", `${API_URL}/health`)
        .its("body")
        .should("have.property", "requestId");

      cy.request("GET", `${API_URL}/api/courses?page=1&limit=10`)
        .its("headers")
        .should("have.property", "x-request-id");
    });
  });

  describe("Performance - Concurrent Requests", () => {
    it("should handle concurrent exam requests", () => {
      const concurrentRequests = Array.from({ length: 10 }, () =>
        cy.request("GET", `${API_URL}/api/courses?page=1&limit=5`)
      );

      cy.wrap(concurrentRequests).then((responses) => {
        responses.forEach((response) => {
          expect(response.status).to.equal(200);
          expect(response.body).to.have.all.keys([
            "data",
            "pagination",
          ]);
        });
      });
    });
  });

  describe("Image Processing - OCR & Compression", () => {
    it("should successfully process valid exam image", () => {
      cy.request({
        method: "POST",
        url: `${API_URL}/api/ai/ocr`,
        body: {
          imageBase64: fixtures.validExamImage,
          mimeType: "image/png",
        },
      })
        .should("have.status", 200)
        .its("body")
        .should("have.property", "text");
    });

    it("should reject invalid image format", () => {
      cy.request({
        method: "POST",
        url: `${API_URL}/api/ai/ocr`,
        body: {
          imageBase64: "not-a-valid-base64",
          mimeType: "text/plain",
        },
        failOnStatusCode: false,
      }).should("have.status", 400);
    });
  });
});
