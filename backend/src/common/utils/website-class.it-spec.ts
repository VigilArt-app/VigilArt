import { normalizeMatchUrl } from "./website-class";

describe("normalizeMatchUrl", () => {
  it("Should collapse a tweet with and without ?lang=es to one value", () => {
    const base = "https://x.com/ayaka_s/status/1777995868702171417";
    expect(normalizeMatchUrl(`${base}?lang=es`)).toBe(normalizeMatchUrl(base));
  });

  it.each([
    ["https://x.com/ayaka_s/status/1777995868702171417?s=20", "x.com"],
    [
      "https://x.com/ayaka_s/status/1777995868702171417?t=Xy3aB9cD1eF2gH4iJ5kL6m&s=19",
      "x.com"
    ],
    [
      "https://twitter.com/ayaka_s/status/1777995868702171417?s=46&t=Xy3aB9cD1eF2gH4iJ5kL6m",
      "twitter.com"
    ]
  ])("Should drop X share parameters from %s", (sharedUrl, host) => {
    expect(normalizeMatchUrl(sharedUrl)).toBe(
      `https://${host}/ayaka_s/status/1777995868702171417`
    );
  });

  it.each([
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ&si=AbC123xyz",
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ&feature=shared"
  ])("Should drop YouTube share parameters from %s and keep the video", (sharedUrl) => {
    expect(normalizeMatchUrl(sharedUrl)).toBe(
      "https://youtube.com/watch?v=dQw4w9WgXcQ"
    );
  });

  it("Should keep the YouTube timestamp t", () => {
    expect(
      normalizeMatchUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42")
    ).toBe("https://youtube.com/watch?v=dQw4w9WgXcQ&t=42");
  });

  it.each(["igsh=MWZ4a2N0bXg5ZHB2Mg==", "igshid=YmMyMTA2M2Y="])(
    "Should drop the Instagram share parameter %s",
    (shareParameter) => {
      expect(
        normalizeMatchUrl(`https://www.instagram.com/p/C1a2B3c4D5e/?${shareParameter}`)
      ).toBe("https://instagram.com/p/C1a2B3c4D5e/");
    }
  );

  it("Should keep s and t outside X", () => {
    expect(normalizeMatchUrl("https://example.com/search?s=art&t=42")).toBe(
      "https://example.com/search?s=art&t=42"
    );
  });

  it("Should strip the fragment", () => {
    expect(normalizeMatchUrl("https://example.com/page#section")).toBe(
      "https://example.com/page"
    );
  });

  it("Should strip tracking parameters and the fragment", () => {
    expect(
      normalizeMatchUrl(
        "https://example.com/page?utm_source=newsletter&resource=two&fbclid=abc&gclid=def#section"
      )
    ).toBe("https://example.com/page?resource=two");
  });

  it("Should collapse variants that differ only by tracking parameters", () => {
    const base = "https://x.com/ayaka_s/status/1777995868702171417";
    expect(normalizeMatchUrl(`${base}?utm_medium=social&fbclid=abc`)).toBe(
      normalizeMatchUrl(base)
    );
  });

  it("Should keep query-identified resources distinct", () => {
    expect(normalizeMatchUrl("https://youtube.com/watch?v=one")).not.toBe(
      normalizeMatchUrl("https://youtube.com/watch?v=two")
    );
  });

  it.each(["art%20print", "a~b", "a%2fb", "art+print"])(
    "Should preserve resource encoding %s when removing tracking parameters",
    (value) => {
      const clean = `https://example.com/page?q=${value}`;
      expect(normalizeMatchUrl(`${clean}&utm_source=email`)).toBe(clean);
      expect(normalizeMatchUrl(`${clean}&utm_source=email`)).toBe(
        normalizeMatchUrl(clean)
      );
    }
  );

  it("Should recognize encoded tracking names without re-encoding other parameters", () => {
    expect(
      normalizeMatchUrl("https://example.com/page?%75tm_source=email&q=art%20print")
    ).toBe("https://example.com/page?q=art%20print");
  });

  it.each(["?id", "?gclid", "?utm_source"])(
    "Should preserve a literal leading question mark in parameter %s",
    (name) => {
      const clean = `https://example.com/page?${name}=42`;
      expect(normalizeMatchUrl(`${clean}&utm_source=email`)).toBe(clean);
      expect(
        normalizeMatchUrl(`https://example.com/page?utm_source=email&${name}=42`)
      ).toBe(clean);
    }
  );

  it("Should remove tracking parameter names case-insensitively", () => {
    expect(
      normalizeMatchUrl(
        "https://example.com/page?UTM_Campaign=launch&FbClId=abc&id=42"
      )
    ).toBe("https://example.com/page?id=42");
  });

  it("Should preserve repeated resource-identifying parameters", () => {
    expect(
      normalizeMatchUrl("https://example.com/search?tag=art&tag=painting")
    ).toBe("https://example.com/search?tag=art&tag=painting");
  });

  it("Should leave a clean URL unchanged", () => {
    expect(normalizeMatchUrl("https://example.com/page")).toBe(
      "https://example.com/page"
    );
  });

  it("Should preserve the path and trailing slash", () => {
    expect(normalizeMatchUrl("https://example.com/a/b/?q=1")).toBe(
      "https://example.com/a/b/?q=1"
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
