import http from "k6/http";
import { check } from "k6";

// Stress test: gradually increase load until system breaks
export const options = {
  stages: [
    { duration: "2m", target: 100 },
    { duration: "2m", target: 200 },
    { duration: "2m", target: 300 },
    { duration: "2m", target: 400 },
    { duration: "2m", target: 500 },
    { duration: "2m", target: 0 }, // Ramp-down
  ],
  thresholds: {
    http_req_duration: ["p(99)<3000"],
    http_req_failed: ["rate<0.5"],
  },
};

export default function () {
  const res = http.get("http://localhost:5001/health");
  
  check(res, {
    "status is 200 or 429": (r) => r.status === 200 || r.status === 429,
  });
}
