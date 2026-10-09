import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { FREE_ARTWORK_LIMIT, SubscriptionTier } from "@vigilart/shared";
import { Prisma } from "@vigilart/shared/server";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ArtworkLimitService {
  constructor(private readonly prisma: PrismaService) {}

  async lockUser(tx: Prisma.TransactionClient, userId: string) {
    const users = await tx.$queryRaw<{ id: string; subscriptionTier: SubscriptionTier }[]>`
      SELECT "id", "subscriptionTier" FROM "User" WHERE "id" = ${userId} FOR UPDATE
    `;
    if (!users[0]) throw new NotFoundException("User does not exist");
    return users[0];
  }

  async assertCapacity(userId: string, additional: number, tx?: Prisma.TransactionClient): Promise<void> {
    if (!tx) {
      await this.prisma.$transaction(async (transaction) => {
        await this.lockUser(transaction, userId);
        await this.assertCapacity(userId, additional, transaction);
      });
      return;
    }
    const user = await tx.user.findUniqueOrThrow({ where: { id: userId }, select: { subscriptionTier: true } });
    if (user.subscriptionTier !== SubscriptionTier.FREE) return;
    const count = await tx.artwork.count({ where: { userId } });
    if (count + additional > FREE_ARTWORK_LIMIT) {
      throw new ForbiddenException("Free accounts are limited to 5 artworks. Remove artworks before uploading or scanning.");
    }
  }
}
