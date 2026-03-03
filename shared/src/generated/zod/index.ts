/**
 * Prisma Zod Generator - Single File (inlined)
 * Auto-generated. Do not edit.
 */

import * as z from 'zod';
// File: TransactionIsolationLevel.schema.ts

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted', 'ReadCommitted', 'RepeatableRead', 'Serializable'])

export type TransactionIsolationLevel = z.infer<typeof TransactionIsolationLevelSchema>;

// File: UserScalarFieldEnum.schema.ts

export const UserScalarFieldEnumSchema = z.enum(['id', 'email', 'password', 'firstName', 'lastName', 'avatar', 'subscriptionTier', 'createdAt', 'updatedAt'])

export type UserScalarFieldEnum = z.infer<typeof UserScalarFieldEnumSchema>;

// File: RefreshTokenScalarFieldEnum.schema.ts

export const RefreshTokenScalarFieldEnumSchema = z.enum(['id', 'userId', 'token', 'deviceInfo', 'ipAddress', 'expiresAt', 'createdAt'])

export type RefreshTokenScalarFieldEnum = z.infer<typeof RefreshTokenScalarFieldEnumSchema>;

// File: ArtworkScalarFieldEnum.schema.ts

export const ArtworkScalarFieldEnumSchema = z.enum(['id', 'userId', 'originalFilename', 'storageKey', 'contentType', 'sizeBytes', 'width', 'height', 'description', 'createdAt', 'updatedAt', 'lastScanAt'])

export type ArtworkScalarFieldEnum = z.infer<typeof ArtworkScalarFieldEnumSchema>;

// File: DmcaPlatformScalarFieldEnum.schema.ts

export const DmcaPlatformScalarFieldEnumSchema = z.enum(['id', 'slug', 'displayName', 'domain', 'dmcaUrl', 'email', 'websiteCategory', 'formSchema', 'createdAt', 'updatedAt'])

export type DmcaPlatformScalarFieldEnum = z.infer<typeof DmcaPlatformScalarFieldEnumSchema>;

// File: DmcaProfileScalarFieldEnum.schema.ts

export const DmcaProfileScalarFieldEnumSchema = z.enum(['id', 'userId', 'fullName', 'street', 'aptSuite', 'city', 'postalCode', 'country', 'email', 'phone', 'signature', 'createdAt', 'updatedAt'])

export type DmcaProfileScalarFieldEnum = z.infer<typeof DmcaProfileScalarFieldEnumSchema>;

// File: DmcaNoticeScalarFieldEnum.schema.ts

export const DmcaNoticeScalarFieldEnumSchema = z.enum(['id', 'userId', 'dmcaPlatformSlug', 'artworkId', 'status', 'payload', 'submittedAt', 'createdAt', 'updatedAt'])

export type DmcaNoticeScalarFieldEnum = z.infer<typeof DmcaNoticeScalarFieldEnumSchema>;

// File: DmcaNoticeDataScalarFieldEnum.schema.ts

export const DmcaNoticeDataScalarFieldEnumSchema = z.enum(['id', 'dmcaNoticeId', 'generated'])

export type DmcaNoticeDataScalarFieldEnum = z.infer<typeof DmcaNoticeDataScalarFieldEnumSchema>;

// File: SortOrder.schema.ts

export const SortOrderSchema = z.enum(['asc', 'desc'])

export type SortOrder = z.infer<typeof SortOrderSchema>;

// File: JsonNullValueInput.schema.ts

export const JsonNullValueInputSchema = z.enum(['JsonNull'])

export type JsonNullValueInput = z.infer<typeof JsonNullValueInputSchema>;

// File: QueryMode.schema.ts

export const QueryModeSchema = z.enum(['default', 'insensitive'])

export type QueryMode = z.infer<typeof QueryModeSchema>;

// File: NullsOrder.schema.ts

export const NullsOrderSchema = z.enum(['first', 'last'])

export type NullsOrder = z.infer<typeof NullsOrderSchema>;

// File: JsonNullValueFilter.schema.ts

export const JsonNullValueFilterSchema = z.enum(['DbNull', 'JsonNull', 'AnyNull'])

export type JsonNullValueFilter = z.infer<typeof JsonNullValueFilterSchema>;

// File: SubscriptionTier.schema.ts

export const SubscriptionTierSchema = z.enum(['FREE', 'CREATOR', 'PRO'])

export type SubscriptionTier = z.infer<typeof SubscriptionTierSchema>;

// File: WebsiteCategory.schema.ts

export const WebsiteCategorySchema = z.enum(['SOCIAL', 'ART_PLATFORMS', 'MARKETPLACES', 'BLOG', 'MEDIA', 'SEARCH', 'OTHER'])

export type WebsiteCategory = z.infer<typeof WebsiteCategorySchema>;

// File: DmcaStatus.schema.ts

export const DmcaStatusSchema = z.enum(['DRAFT', 'SUBMITTED'])

export type DmcaStatus = z.infer<typeof DmcaStatusSchema>;

// File: User.schema.ts

export const UserSchema = z.object({
  id: z.string(),
  email: z.string(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  avatar: z.string().nullable(),
  subscriptionTier: SubscriptionTierSchema.default("FREE"),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type UserType = z.infer<typeof UserSchema>;


// File: RefreshToken.schema.ts

export const RefreshTokenSchema = z.object({
  id: z.string(),
  userId: z.string(),
  token: z.string(),
  deviceInfo: z.string().nullable(),
  ipAddress: z.string().nullable(),
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date(),
});

export type RefreshTokenType = z.infer<typeof RefreshTokenSchema>;


// File: Artwork.schema.ts

export const ArtworkSchema = z.object({
  id: z.string(),
  userId: z.string(),
  originalFilename: z.string(),
  storageKey: z.string(),
  contentType: z.string(),
  sizeBytes: z.number().int(),
  width: z.number().int(),
  height: z.number().int(),
  description: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  lastScanAt: z.coerce.date().nullable(),
});

export type ArtworkType = z.infer<typeof ArtworkSchema>;


// File: DmcaPlatform.schema.ts

export const DmcaPlatformSchema = z.object({
  id: z.string(),
  slug: z.string(),
  displayName: z.string(),
  domain: z.string(),
  dmcaUrl: z.string(),
  email: z.string(),
  websiteCategory: WebsiteCategorySchema,
  formSchema: z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10"),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type DmcaPlatformType = z.infer<typeof DmcaPlatformSchema>;


// File: DmcaProfile.schema.ts

export const DmcaProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  fullName: z.string().nullable(),
  street: z.string().nullable(),
  aptSuite: z.string().nullable(),
  city: z.string().nullable(),
  postalCode: z.string().nullable(),
  country: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  signature: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type DmcaProfileType = z.infer<typeof DmcaProfileSchema>;


// File: DmcaNotice.schema.ts

export const DmcaNoticeSchema = z.object({
  id: z.string(),
  userId: z.string().nullable(),
  dmcaPlatformSlug: z.string(),
  artworkId: z.string().nullable(),
  status: DmcaStatusSchema.default("DRAFT"),
  payload: z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10").default("{}"),
  submittedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type DmcaNoticeType = z.infer<typeof DmcaNoticeSchema>;


// File: DmcaNoticeData.schema.ts

export const DmcaNoticeDataSchema = z.object({
  id: z.string(),
  dmcaNoticeId: z.string(),
  generated: z.number().int(),
});

export type DmcaNoticeDataType = z.infer<typeof DmcaNoticeDataSchema>;

