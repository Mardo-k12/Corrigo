import http from "k6/http";
import { check } from "k6";

// Spike test: sudden traffic surge
export const options = {
  stages: [
    { duration: "1m", target: 50 }, // Baseline
    { duration: "10s", target: 500 }, // Sudden spike
    { duration: "1m", target: 500 }, // Hold spike
    { duration: "10s", target: 50 }, // Back to baseline
  ],
  thresholds: {
    http_req_duration: ["p(99)<5000"],
  },
};

export default function () {
  const res = http.get("http://localhost:5001/health");
  
  check(res, {
    "spike response time acceptable": (r) => r.timings.duration < 5000,
  });
}
