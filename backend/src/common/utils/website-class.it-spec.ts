import { normalizeMatchUrl } from "./website-class";

describe("normalizeMatchUrl", () => {
  it("Should strip the query string", () => {
    expect(
      normalizeMatchUrl("https://x.com/ayaka_s/status/1777995868702171417?lang=es")
    ).toBe("https://x.com/ayaka_s/status/1777995868702171417");
  });

  it("Should strip the fragment", () => {
    expect(normalizeMatchUrl("https://example.com/page#section")).toBe(
      "https://example.com/page"
    );
  });

  it("Should strip both query string and fragment", () => {
    expect(
      normalizeMatchUrl("https://example.com/page?utm=1&x=2#section")
    ).toBe("https://example.com/page");
  });

  it("Should collapse query-only variants of the same page to one value", () => {
    const base = "https://x.com/ayaka_s/status/1777995868702171417";
    expect(normalizeMatchUrl(`${base}?lang=es`)).toBe(
      normalizeMatchUrl(base)
    );
  });

  it("Should leave a clean URL unchanged", () => {
    expect(normalizeMatchUrl("https://example.com/page")).toBe(
      "https://example.com/page"
    );
  });

  it("Should preserve the path and trailing slash", () => {
    expect(normalizeMatchUrl("https://example.com/a/b/?q=1")).toBe(
      "https://example.com/a/b/"
    );
  });

  it("Should return an un-parseable string untouched", () => {
    expect(normalizeMatchUrl("not a url")).toBe("not a url");
  });
});
