import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "2m", target: 100 }, // Ramp-up
    { duration: "5m", target: 100 }, // Stay
    { duration: "2m", target: 200 }, // Spike
    { duration: "5m", target: 200 }, // Stay
    { duration: "2m", target: 0 }, // Ramp-down
  ],
  thresholds: {
    http_req_duration: ["p(95)<500", "p(99)<1000"],
    http_req_failed: ["rate<0.1"],
  },
};

export default function () {
  // Health check
  let res = http.get("http://localhost:5001/health");
  check(res, {
    "health status is 200": (r) => r.status === 200,
    "health response time < 100ms": (r) => r.timings.duration < 100,
  });

  sleep(1);

  // OCR endpoint
  const ocrPayload = JSON.stringify({
    imageBase64:
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    mimeType: "image/png",
  });

  res = http.post("http://localhost:5001/api/ai/ocr", ocrPayload, {
    headers: { "Content-Type": "application/json" },
  });

  check(res, {
    "ocr response time < 2000ms": (r) => r.timings.duration < 2000,
    "ocr status not 5xx": (r) => r.status < 500,
  });

  sleep(1);
}
