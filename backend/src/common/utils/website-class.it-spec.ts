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

  it("Should treat a country-code subdomain and www as the same host", () => {
    expect(normalizeMatchUrl("https://uk.pinterest.com/gogotsakoyani/")).toBe(
      normalizeMatchUrl("https://www.pinterest.com/gogotsakoyani/")
    );
  });

  it("Should strip a bare www. host to the registrable domain", () => {
    expect(normalizeMatchUrl("https://www.pinterest.com/gogotsakoyani/")).toBe(
      "https://pinterest.com/gogotsakoyani/"
    );
  });

  it("Should keep meaningful subdomains distinct", () => {
    expect(normalizeMatchUrl("https://alice.wixsite.com/portfolio")).not.toBe(
      normalizeMatchUrl("https://bob.wixsite.com/portfolio")
    );
  });

  it("Should not strip a label when no registrable domain would remain", () => {
    // `co.uk` is a public suffix, not a registrable domain, so `www.` stays.
    expect(normalizeMatchUrl("https://www.co.uk/page")).toBe(
      "https://www.co.uk/page"
    );
  });
});
