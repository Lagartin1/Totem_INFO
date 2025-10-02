import { HealthStatus } from "../models/HealthStatus";

export class HealthService {
  static getStatus(): HealthStatus {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }
}
