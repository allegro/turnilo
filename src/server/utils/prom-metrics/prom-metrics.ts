import { Counter, Histogram } from "prom-client";

export const plywoodRequests = new Counter({
  name: "turnilo_plywood_requests",
  help: "Total number of requests recieved on plywood endpoint",
  labelNames: ["dataCube", "status"]
});

export const plywoodRequestDuration = new Histogram({
  name: "turnilo_plywood_request_duration",
  help: "Request duration for plywood queries",
  labelNames: ["dataCube", "status"]
});

export const plywoodTimeouts = new Counter({
  name: "turnilo_plywood_timeouts",
  help: "Total number of plywood timeouts",
  labelNames: ["dataCube", "message"]
});
