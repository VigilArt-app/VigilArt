import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
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

@Injectable()
export class StorageService {
  private readonly s3: S3Client;
  private readonly bucketName;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {
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

  async getUploadUrl(fileKey: string): Promise<string> {
    const fileExt = path.extname(fileKey);
    const fileName =
      fileKey.replace(fileExt, "").toLowerCase().split(" ").join("-") +
      Date.now() +
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

    return await getSignedUrl(this.s3, command, { expiresIn: 3600 });
  }

  async getDownloadUrl(fileKey: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    });

    return await getSignedUrl(this.s3, command, { expiresIn: 3600 });
  }

  async deleteImage(fileKey: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      })
    );
  }

  async deleteImages(fileKeys: string[]): Promise<void> {
    await this.s3.send(
      new DeleteObjectsCommand({
        Bucket: this.bucketName,
        Delete: {
          Objects: fileKeys.map((fileKey) => ({ Key: fileKey })),
        },
      })
    );
  }
}
