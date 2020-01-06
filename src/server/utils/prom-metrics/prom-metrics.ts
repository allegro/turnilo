import { Counter, Histogram } from "prom-client";

export const plywoodRequestDuration = new Histogram({
  name: "turnilo_plywood_request_duration_seconds",
  help: "Request duration for plywood queries",
  labelNames: ["dataCube", "status"],
  buckets: [1, 5, 10, 30, 60, 120, 300]
});

export const plywoodErrors = new Counter({
  name: "turnilo_plywood_errors",
  help: "Total number of plywood errors",
  labelNames: ["dataCube"]
});
