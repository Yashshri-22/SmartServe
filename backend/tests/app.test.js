const request = require("supertest");
const app = require("../index");

describe("SmartServe Backend", () => {
  test("API should respond to an unknown route", async () => {
    const response = await request(app).get("/api/test-route");

    expect(response.statusCode).toBe(404);
  });
});