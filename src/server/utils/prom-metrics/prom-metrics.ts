import { Counter, Histogram } from "prom-client";

export const plywoodRequests = new Counter({
  name: "turnilo_plywood_requests",
  help: "Total number of requests recieved on plywood endpoint",
  labelNames: ["dataCube", "status"]
});

export const plywoodRequestDuration = new Histogram({
  name: "turnilo_plywood_request_duration_seconds",
  help: "Request duration for plywood queries",
  labelNames: ["dataCube", "status"],
  buckets: [1, 5, 10, 30, 60, 120, 300]
});

export const plywoodTimeouts = new Counter({
  name: "turnilo_plywood_timeouts",
  help: "Total number of plywood timeouts",
  labelNames: ["dataCube", "message"]
});
