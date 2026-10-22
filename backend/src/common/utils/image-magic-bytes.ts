// Decide an upload's type from its own first bytes rather than its filename.
// The rest of the backend trusts `mime-types.lookup(filename)`, so a file
// renamed to `.jpg` is accepted whatever it actually contains — fine for a
// logged-in user who owns the bucket prefix, not for an anonymous route.

// Every PNG file begins with this 8-byte signature (PNG spec, §5.2). The
// \r\n and \x1a bytes are there to catch corruption by text-mode transfers.
const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a
]);

// Every JPEG begins with SOI (FF D8) immediately followed by a marker (FF xx).
const JPEG_SIGNATURE = Buffer.from([0xff, 0xd8, 0xff]);

export type SniffedImageType = "image/jpeg" | "image/png";

export function sniffImageType(buf: Buffer): SniffedImageType | null {
  if (buf.length >= PNG_SIGNATURE.length && buf.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
    return "image/png";
  }
  if (buf.length >= JPEG_SIGNATURE.length && buf.subarray(0, JPEG_SIGNATURE.length).equals(JPEG_SIGNATURE)) {
    return "image/jpeg";
  }
  return null;
}

export function extensionForImageType(type: SniffedImageType): string {
  return type === "image/png" ? ".png" : ".jpg";
}
