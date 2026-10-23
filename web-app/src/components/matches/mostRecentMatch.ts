interface DatedMatch {
  firstDetectedAt: string | Date;
  unsafeDomain?: boolean;
}

// Match the existing summary derivation, including its first-match tie breaker.
export const mostRecentMatch = <T extends DatedMatch>(pages: T[]): T | undefined =>
  pages.reduce<T | undefined>((latest, page) =>
    !latest || new Date(page.firstDetectedAt) > new Date(latest.firstDetectedAt) ? page : latest,
  undefined);
