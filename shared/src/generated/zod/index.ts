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

// File: ArtworkScalarFieldEnum.schema.ts

export const ArtworkScalarFieldEnumSchema = z.enum(['id', 'userId', 'imageUri', 'originalFilename', 'contentType', 'sizeBytes', 'description', 'createdAt', 'updatedAt', 'lastScanAt'])

export type ArtworkScalarFieldEnum = z.infer<typeof ArtworkScalarFieldEnumSchema>;

// File: DmcaPlatformScalarFieldEnum.schema.ts

export const DmcaPlatformScalarFieldEnumSchema = z.enum(['id', 'slug', 'displayName', 'domain', 'dmcaUrl', 'websiteCategory', 'formSchema', 'createdAt', 'updatedAt'])

export type DmcaPlatformScalarFieldEnum = z.infer<typeof DmcaPlatformScalarFieldEnumSchema>;

// File: DmcaProfileScalarFieldEnum.schema.ts

export const DmcaProfileScalarFieldEnumSchema = z.enum(['id', 'userId', 'fullName', 'addressLine1', 'addressLine2', 'city', 'postalCode', 'country', 'email', 'phone', 'signature', 'createdAt', 'updatedAt'])

export type DmcaProfileScalarFieldEnum = z.infer<typeof DmcaProfileScalarFieldEnumSchema>;

// File: DmcaNoticeScalarFieldEnum.schema.ts

export const DmcaNoticeScalarFieldEnumSchema = z.enum(['id', 'userId', 'dmcaPlatformSlug', 'artworkId', 'status', 'payload', 'body', 'submittedAt', 'createdAt', 'updatedAt'])

export type DmcaNoticeScalarFieldEnum = z.infer<typeof DmcaNoticeScalarFieldEnumSchema>;

// File: SortOrder.schema.ts

export const SortOrderSchema = z.enum(['asc', 'desc'])

export type SortOrder = z.infer<typeof SortOrderSchema>;

// File: JsonNullValueInput.schema.ts

export const JsonNullValueInputSchema = z.enum(['JsonNull'])

export type JsonNullValueInput = z.infer<typeof JsonNullValueInputSchema>;

// File: NullableJsonNullValueInput.schema.ts

export const NullableJsonNullValueInputSchema = z.enum(['DbNull', 'JsonNull'])

export type NullableJsonNullValueInput = z.infer<typeof NullableJsonNullValueInputSchema>;

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

export const DmcaStatusSchema = z.enum(['DRAFT', 'GENERATED', 'EXPORTED', 'SUBMITTED'])

export type DmcaStatus = z.infer<typeof DmcaStatusSchema>;

// File: User.schema.ts

export const UserSchema = z.object({
  id: z.string(),
  email: z.string(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  avatar: z.string().optional(),
  subscriptionTier: SubscriptionTierSchema.default("FREE"),
  createdAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/, "Invalid ISO datetime"),
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/, "Invalid ISO datetime"),
});

export type UserType = z.infer<typeof UserSchema>;


// File: Artwork.schema.ts

export const ArtworkSchema = z.object({
  id: z.string(),
  userId: z.string(),
  imageUri: z.string(),
  originalFilename: z.string().optional(),
  contentType: z.string().optional(),
  sizeBytes: z.number().int().optional(),
  description: z.string().optional(),
  createdAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/, "Invalid ISO datetime"),
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/, "Invalid ISO datetime"),
  lastScanAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/, "Invalid ISO datetime").optional(),
});

export type ArtworkType = z.infer<typeof ArtworkSchema>;


// File: DmcaPlatform.schema.ts

export const DmcaPlatformSchema = z.object({
  id: z.string(),
  slug: z.string(),
  displayName: z.string(),
  domain: z.string(),
  dmcaUrl: z.string(),
  websiteCategory: WebsiteCategorySchema,
  formSchema: z.any().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10"),
  createdAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/, "Invalid ISO datetime"),
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/, "Invalid ISO datetime"),
});

export type DmcaPlatformType = z.infer<typeof DmcaPlatformSchema>;


// File: DmcaProfile.schema.ts

export const DmcaProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  fullName: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  signature: z.string().optional(),
  createdAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/, "Invalid ISO datetime"),
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/, "Invalid ISO datetime"),
});

export type DmcaProfileType = z.infer<typeof DmcaProfileSchema>;


// File: DmcaNotice.schema.ts

export const DmcaNoticeSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  dmcaPlatformSlug: z.string(),
  artworkId: z.string().optional(),
  status: DmcaStatusSchema.default("DRAFT"),
  payload: z.any().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10").optional(),
  body: z.string().optional(),
  submittedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/, "Invalid ISO datetime").optional(),
  createdAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/, "Invalid ISO datetime"),
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/, "Invalid ISO datetime"),
});

export type DmcaNoticeType = z.infer<typeof DmcaNoticeSchema>;

