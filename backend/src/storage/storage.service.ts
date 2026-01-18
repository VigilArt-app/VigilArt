import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as path from "path";
import { lookup } from "mime-types";
import {
  DownloadUrlsGetDTO,
  UploadUrlGet,
  UploadUrlsGet,
} from "@vigilart/shared";

@Injectable()
export class StorageService {
  private readonly s3: S3Client;
  private readonly bucketName;

  constructor(private readonly config: ConfigService) {
    this.bucketName = this.config.getOrThrow("CLOUDFLARE_BUCKET_NAME");
    this.s3 = new S3Client({
      endpoint: this.config.getOrThrow("CLOUDFLARE_R2_ENDPOINT"),
      credentials: {
        accessKeyId: this.config.getOrThrow("CLOUDFLARE_R2_ACCESS_KEY"),
        secretAccessKey: this.config.getOrThrow("CLOUDFLARE_R2_SECRET_KEY"),
      },
      region: "auto",
    });
  }

  async getUploadUrl(fileKey: string): Promise<UploadUrlGet> {
    const fileExt = path.extname(fileKey);
    const fileName =
      "artworks/" +
      fileKey.replace(fileExt, "").toLowerCase().split(" ").join("-") +
      crypto.randomUUID() +
      fileExt;
    const contentType = lookup(fileExt);

    if (contentType != "image/jpeg" && contentType != "image/png") {
      throw new BadRequestException("Only JPEG and PNG formats are supported.");
    }

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
      ContentType: contentType,
      CacheControl: "private, max-age=31536000",
    });

    const signedUrl = await getSignedUrl(this.s3, command, { expiresIn: 3600 });

    return {
      storageKey: fileName,
      presignedUrl: signedUrl,
    };
  }

  async getUploadUrls(filesKeys: string[]): Promise<UploadUrlsGet> {
    const uploadUrls = await Promise.all(
      filesKeys.map(async (fileKey: string) => {
        const uploadUrlGet = await this.getUploadUrl(fileKey);

        return { fileKey, ...uploadUrlGet };
      }),
    );

    const uploadUrlMap: Record<string, UploadUrlGet> = uploadUrls.reduce(
      (accumulator, { fileKey, storageKey, presignedUrl }) => {
        const fileExt = path.extname(fileKey);
        const cleanFileKey = fileKey
          .replace(fileExt, "")
          .toLowerCase()
          .split(" ")
          .join("-") + fileExt;
        accumulator[cleanFileKey] = {
          storageKey,
          presignedUrl,
        };
        return accumulator;
      },
      {} as Record<string, UploadUrlGet>,
    );

    return uploadUrlMap;
  }

  async getDownloadUrl(fileKey: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    });

    return await getSignedUrl(this.s3, command, { expiresIn: 3600 });
  }

  async getDownloadUrls(filesKeys: string[]): Promise<DownloadUrlsGetDTO> {
    const downloadUrls = await Promise.all(
      filesKeys.map(async (fileKey: string) => {
        const presignedUrl = await this.getDownloadUrl(fileKey);

        return { fileKey: fileKey, presignedUrl: presignedUrl };
      }),
    );

    const downloadUrlMap: Record<string, string> = downloadUrls.reduce(
      (accumulator, { fileKey, presignedUrl }) => {
        accumulator[fileKey] = presignedUrl;
        return accumulator;
      },
      {} as Record<string, string>,
    );

    return downloadUrlMap;
  }

  async deleteImage(fileKey: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      }),
    );
  }

  async deleteImages(fileKeys: string[]): Promise<void> {
    await this.s3.send(
      new DeleteObjectsCommand({
        Bucket: this.bucketName,
        Delete: {
          Objects: fileKeys.map((fileKey) => ({ Key: fileKey })),
        },
      }),
    );
  }

  async getImage(fileKey: string): Promise<Buffer> {
    const res = await this.s3.send(
      new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      }),
    );

    if (!res.Body) {
      throw new InternalServerErrorException();
    }
    const byteArray = await res.Body?.transformToByteArray();
    return Buffer.from(byteArray);
  }
}
