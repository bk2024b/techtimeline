import { describe, it, expect, vi } from "vitest";
import { slugify, excerptFromMarkdown, checkRateLimit } from "./index";

describe("slugify", () => {
  it("lowercases and replaces spaces with dashes", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("strips accents", () => {
    expect(slugify("Écran incurvé")).toBe("ecran-incurve");
  });

  it("strips punctuation and collapses repeated separators", () => {
    expect(slugify("iPhone 15 Pro Max!!")).toBe("iphone-15-pro-max");
  });

  it("trims leading/trailing dashes", () => {
    expect(slugify("  -Test-  ")).toBe("test");
  });
});

describe("excerptFromMarkdown", () => {
  it("strips common markdown syntax", () => {
    expect(excerptFromMarkdown("# Title\n\n**bold** and _italic_ and `code`")).toBe(
      "Title bold and italic and code"
    );
  });

  it("truncates with an ellipsis beyond maxLength", () => {
    const long = "a".repeat(200);
    const result = excerptFromMarkdown(long, 160);
    expect(result.length).toBe(161); // 160 chars + "…"
    expect(result.endsWith("…")).toBe(true);
  });

  it("returns short content unchanged (no ellipsis)", () => {
    expect(excerptFromMarkdown("short text")).toBe("short text");
  });
});

describe("checkRateLimit", () => {
  it("allows requests under the limit", () => {
    const key = `test-${Math.random()}`;
    const result = checkRateLimit(key, 3, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("blocks requests once the limit is exceeded", () => {
    const key = `test-${Math.random()}`;
    checkRateLimit(key, 2, 60_000);
    checkRateLimit(key, 2, 60_000);
    const third = checkRateLimit(key, 2, 60_000);
    expect(third.allowed).toBe(false);
    expect(third.remaining).toBe(0);
  });

  it("resets after the time window elapses", () => {
    vi.useFakeTimers();
    const key = `test-${Math.random()}`;
    checkRateLimit(key, 1, 1_000);
    expect(checkRateLimit(key, 1, 1_000).allowed).toBe(false);

    vi.advanceTimersByTime(1_001);
    expect(checkRateLimit(key, 1, 1_000).allowed).toBe(true);
    vi.useRealTimers();
  });
});
