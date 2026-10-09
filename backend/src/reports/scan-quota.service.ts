import { ForbiddenException, Injectable } from "@nestjs/common";
import { ScanQuota, SubscriptionTier } from "@vigilart/shared";
import { Prisma } from "@vigilart/shared/server";
import { PrismaService } from "../prisma/prisma.service";
import { ArtworkLimitService } from "../artworks/artwork-limit.service";
import { FREE_SCANS_PER_WINDOW, MAX_SCANS_PER_WINDOW, SCAN_WINDOW_DAYS } from "./reports.constants";

const WINDOW_MS = SCAN_WINDOW_DAYS * 24 * 60 * 60 * 1000;

@Injectable()
export class ScanQuotaService {
  constructor(private readonly prisma: PrismaService, private readonly artworkLimit: ArtworkLimitService) {}

  private async readQuota(tx: Prisma.TransactionClient, userId: string, tier: SubscriptionTier): Promise<ScanQuota> {
    const limit = tier === SubscriptionTier.FREE ? FREE_SCANS_PER_WINDOW : MAX_SCANS_PER_WINDOW;
    const usages = await tx.scanUsage.findMany({
      where: { userId, startedAt: { gt: new Date(Date.now() - WINDOW_MS) } },
      orderBy: { startedAt: "asc" }, select: { startedAt: true }
    });
    const remaining = Math.max(0, limit - usages.length);
    return { remaining, limit, nextAvailableAt: remaining > 0 ? null
      : new Date(usages[usages.length - limit].startedAt.getTime() + WINDOW_MS).toISOString() };
  }

  async getScanQuota(userId: string): Promise<ScanQuota> {
    return this.prisma.$transaction(async (tx) => {
      const user = await this.artworkLimit.lockUser(tx, userId);
      return this.readQuota(tx, userId, user.subscriptionTier);
    });
  }

  async consumeScan(userId: string, scanId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const user = await this.artworkLimit.lockUser(tx, userId);
      const existing = await tx.scanUsage.findUnique({ where: { id: scanId } });
      if (existing) {
        if (existing.userId !== userId) throw new ForbiddenException("Scan belongs to another account.");
        return;
      }
      await this.artworkLimit.assertCapacity(userId, 0, tx);
      const quota = await this.readQuota(tx, userId, user.subscriptionTier);
      if (quota.remaining === 0) throw new ForbiddenException(`You have reached the maximum of ${quota.limit} scans per ${SCAN_WINDOW_DAYS} days.`);
      await tx.scanUsage.create({ data: { id: scanId, userId } });
    });
  }
}
