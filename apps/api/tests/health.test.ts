import request from "supertest";
import { createApp } from "../src/app";

// Note: this hits REAL Postgres and Redis (via the health route), so
// `docker-compose up -d postgres redis` must be running before `npm test`.
// That's intentional for Phase 2 — there's no business logic yet to unit
// test in isolation; the only thing worth proving right now is that the
// three services can actually talk to each other.

describe("GET /api/v1/health", () => {
  const app = createApp();

  it("returns 200 and reports both database and redis as ok when services are reachable", async () => {
    const response = await request(app).get("/api/v1/health");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.checks).toEqual({
      database: "ok",
      redis: "ok",
    });
  });

  it("returns a 404 JSON shape for an unknown route", async () => {
    const response = await request(app).get("/api/v1/does-not-exist");

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
});
