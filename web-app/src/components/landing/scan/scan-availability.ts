interface PublicScanAvailability {
  hasFile: boolean;
  busy: boolean;
  turnstileRequired: boolean;
  turnstileToken: string | null;
}

export function isPublicScanDisabled({
  hasFile,
  busy,
  turnstileRequired,
  turnstileToken
}: PublicScanAvailability): boolean {
  return !hasFile || busy || (turnstileRequired && !turnstileToken);
}
