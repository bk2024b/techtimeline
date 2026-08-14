import { describe, it, expect } from "vitest";
import { hasRole } from "./index";

describe("hasRole", () => {
  it("allows a role to satisfy its own requirement", () => {
    expect(hasRole("editor", "editor")).toBe(true);
  });

  it("allows a higher-ranked role to satisfy a lower requirement", () => {
    expect(hasRole("admin", "editor")).toBe(true);
    expect(hasRole("admin", "writer")).toBe(true);
    expect(hasRole("editor", "writer")).toBe(true);
  });

  it("rejects a lower-ranked role", () => {
    expect(hasRole("writer", "editor")).toBe(false);
    expect(hasRole("writer", "admin")).toBe(false);
    expect(hasRole("editor", "admin")).toBe(false);
  });
});
