import { sniffImageType, extensionForImageType } from "./image-magic-bytes";

const PNG_HEADER = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPEG_HEADER = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);

describe("sniffImageType", () => {
  it("Should recognise a PNG by its signature", () => {
    expect(sniffImageType(Buffer.concat([PNG_HEADER, Buffer.alloc(64)]))).toBe(
      "image/png"
    );
  });

  it("Should recognise a JPEG by its signature", () => {
    expect(sniffImageType(Buffer.concat([JPEG_HEADER, Buffer.alloc(64)]))).toBe(
      "image/jpeg"
    );
  });

  // The whole point of sniffing: an executable renamed to artwork.png would be
  // accepted by a filename-based check and uploaded to the bucket.
  it("Should reject a non-image whatever its filename claims", () => {
    const elf = Buffer.from([0x7f, 0x45, 0x4c, 0x46, 0x02, 0x01, 0x01, 0x00]);
    expect(sniffImageType(elf)).toBeNull();
  });

  it("Should reject a GIF, which the pipeline does not support", () => {
    expect(sniffImageType(Buffer.from("GIF89a", "ascii"))).toBeNull();
  });

  // A truncated upload must not pass by matching a prefix of the signature.
  it("Should reject a buffer shorter than the signature", () => {
    expect(sniffImageType(PNG_HEADER.subarray(0, 4))).toBeNull();
    expect(sniffImageType(Buffer.alloc(0))).toBeNull();
  });

  it("Should map each type to the extension used for the storage key", () => {
    expect(extensionForImageType("image/png")).toBe(".png");
    expect(extensionForImageType("image/jpeg")).toBe(".jpg");
  });
});
