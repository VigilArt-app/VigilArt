import { z } from 'zod';
import type { Prisma } from '../prisma/client';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////


/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted','ReadCommitted','RepeatableRead','Serializable']);

export const UserScalarFieldEnumSchema = z.enum(['id','email','password','firstName','lastName','avatar','subscriptionTier','createdAt','updatedAt']);

export const DmcaPlatformScalarFieldEnumSchema = z.enum(['id','code','displayName','domain','dmcaUrl','createdAt','updatedAt']);

export const DmcaProfileScalarFieldEnumSchema = z.enum(['id','userId','fullName','addressLine1','addressLine2','city','postalCode','country','email','phone','signature','createdAt','updatedAt']);

export const DmcaNoticeScalarFieldEnumSchema = z.enum(['id','userId','dmcaPlatformCode','status','body','submittedAt','createdAt','updatedAt']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const QueryModeSchema = z.enum(['default','insensitive']);

export const NullsOrderSchema = z.enum(['first','last']);

export const DmcaPlatformCodeSchema = z.enum(['PINTEREST','ETSY','REDBUBBLE','INSTAGRAM','X','DEVIANTART','TUMBLR','OTHER']);

export type DmcaPlatformCodeType = `${z.infer<typeof DmcaPlatformCodeSchema>}`

export const DmcaStatusSchema = z.enum(['DRAFT','GENERATED','EXPORTED','SUBMITTED']);

export type DmcaStatusType = `${z.infer<typeof DmcaStatusSchema>}`

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
  id: z.uuid(),
  email: z.string(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  avatar: z.string().nullable(),
  subscriptionTier: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type User = z.infer<typeof UserSchema>

/////////////////////////////////////////
// DMCA PLATFORM SCHEMA
/////////////////////////////////////////

export const DmcaPlatformSchema = z.object({
  code: DmcaPlatformCodeSchema,
  id: z.uuid(),
  displayName: z.string(),
  domain: z.string(),
  dmcaUrl: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type DmcaPlatform = z.infer<typeof DmcaPlatformSchema>

/////////////////////////////////////////
// DMCA PROFILE SCHEMA
/////////////////////////////////////////

export const DmcaProfileSchema = z.object({
  id: z.uuid(),
  userId: z.string(),
  fullName: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().nullable(),
  city: z.string().nullable(),
  postalCode: z.string().nullable(),
  country: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  signature: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type DmcaProfile = z.infer<typeof DmcaProfileSchema>

/////////////////////////////////////////
// DMCA NOTICE SCHEMA
/////////////////////////////////////////

export const DmcaNoticeSchema = z.object({
  dmcaPlatformCode: DmcaPlatformCodeSchema,
  status: DmcaStatusSchema,
  id: z.uuid(),
  userId: z.string().nullable(),
  body: z.string().nullable(),
  submittedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type DmcaNotice = z.infer<typeof DmcaNoticeSchema>
