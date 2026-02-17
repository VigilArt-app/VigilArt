import { z } from 'zod';
import type { Prisma } from '../prisma/client';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////


/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted','ReadCommitted','RepeatableRead','Serializable']);

export const UserScalarFieldEnumSchema = z.enum(['id','email','password','firstName','lastName','avatar','createdAt','subscriptionTier']);

export const ArtworkScalarFieldEnumSchema = z.enum(['id','userId','originalFilename','storageKey','contentType','sizeBytes','width','height','description','createdAt','updatedAt','lastScanAt']);

export const MatchingPageScalarFieldEnumSchema = z.enum(['id','artworkId','url','category','websiteName','imageUrl','pageTitle','firstDetectedAt']);

export const ArtworksReportScalarFieldEnumSchema = z.enum(['id','userId','detectionDate']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const QueryModeSchema = z.enum(['default','insensitive']);

export const NullsOrderSchema = z.enum(['first','last']);

export const SubscriptionTierSchema = z.enum(['FREE','CREATOR','PRO']);

export type SubscriptionTierType = `${z.infer<typeof SubscriptionTierSchema>}`

export const WebsiteCategorySchema = z.enum(['SOCIAL','ART_PLATFORMS','MARKETPLACES','BLOG','MEDIA','SEARCH','OTHER']);

export type WebsiteCategoryType = `${z.infer<typeof WebsiteCategorySchema>}`

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
  subscriptionTier: SubscriptionTierSchema,
  id: z.uuid(),
  email: z.string(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  avatar: z.string().nullable(),
  createdAt: z.coerce.date(),
})

export type User = z.infer<typeof UserSchema>

/////////////////////////////////////////
// ARTWORK SCHEMA
/////////////////////////////////////////

export const ArtworkSchema = z.object({
  id: z.uuid(),
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
})

export type Artwork = z.infer<typeof ArtworkSchema>

/////////////////////////////////////////
// MATCHING PAGE SCHEMA
/////////////////////////////////////////

export const MatchingPageSchema = z.object({
  category: WebsiteCategorySchema,
  id: z.uuid(),
  artworkId: z.string(),
  url: z.string(),
  websiteName: z.string(),
  imageUrl: z.string().nullable(),
  pageTitle: z.string().nullable(),
  firstDetectedAt: z.coerce.date(),
})

export type MatchingPage = z.infer<typeof MatchingPageSchema>

/////////////////////////////////////////
// ARTWORKS REPORT SCHEMA
/////////////////////////////////////////

export const ArtworksReportSchema = z.object({
  id: z.uuid(),
  userId: z.string(),
  detectionDate: z.coerce.date(),
})

export type ArtworksReport = z.infer<typeof ArtworksReportSchema>
