# Shared Module Documentation

## Overview

The `@vigilart/shared` package is a centralized module shared between the **frontend** (Next.js web app) and **backend** (NestJS API). It contains reusable validation schemas, types, constants, and utilities that ensure consistency and type safety across the entire application.

## Purpose

- **Single Source of Truth**: Define data structures once, use everywhere
- **Type Safety**: Share TypeScript types between frontend and backend
- **Validation Consistency**: Use the same validation rules on both client and server
- **Code Reusability**: Constants, enums, and utility functions available to all services
- **API Documentation**: Automatic Swagger documentation generation from schemas

## Folder Structure

```
shared/src/
├── schemas/          # Zod schema definitions and DTO classes
├── types/            # TypeScript types
├── generated/        # Auto-generated files (Prisma, Zod)
├── constants/        # Application-wide constants
├── enums/            # Shared enumerations
├── functions/        # Utility functions
├── server.ts         # Export for prisma server-side utilities
└── index.ts          # Public exports
```

## Core Concepts

### 1. Schemas (`shared/src/schemas/`)

**Purpose**: Define validation schemas using Zod that can be used on both frontend and backend.

**Key Points**:
- Zod schemas define the structure and validation rules for data
- Can be used for **runtime validation** in both frontend and backend
- Especially useful in the frontend for form validation without duplicating rules
- Schemas are stored in organized subdirectories (e.g., `Api/`, `Dmca/`, `User/`)

**Example**:
```typescript
// shared/src/schemas/User/index.ts
import { z } from "zod";

export const UserCreateSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export const UserGetSchema = UserCreateSchema.extend({
  id: z.string().uuid(),
  createdAt: z.string(), // ISO date string
});
```

**Frontend Usage**:
```typescript
import { UserCreateSchema } from "@vigilart/shared/schemas";

// Validate form data before submission
const result = UserCreateSchema.safeParse(formData);
if (!result.success) {
  console.error(result.error.issues); // Show validation errors
}
```

#### 1b. DTO Classes

Created from Zod schemas using `createZodDto()` from the `nestjs-zod` library. These are **classes** that wrap Zod schemas and are used by NestJS decorators for Swagger documentation and validation.

**Example**:
```typescript
// shared/src/schemas/User/index.ts
import { createZodDto } from "nestjs-zod";
import { UserCreateSchema, UserGetSchema } from ".";

export class UserCreateDTO extends createZodDto(UserCreateSchema) {}
export class UserGetDTO extends createZodDto(UserGetSchema) {}
```

**Why Classes?**
- NestJS Swagger needs **classes** (not types) to generate API documentation
- `createZodDto()` creates a class that Swagger can introspect
- Provides both runtime and compile-time type information

**Backend Usage**:
```typescript
import { ApiEndpoint } from "@backend/common/decorators";
import { UserCreateDTO, UserGetDTO } from "@vigilart/shared/schemas";

@Post()
@ApiEndpoint({
  summary: "Create a user",
  success: { status: HttpStatus.CREATED, type: UserCreateDTO }
})
async createUser(@Body() user: UserCreateDTO): Promise<UserGetDTO> {
  // ...
}
```

### 2. Types (`shared/src/types/`)

**Purpose**: Provide TypeScript types for type-safe code.

#### TypeScript Types

Automatically inferred from Zod schemas using `z.infer<>`. Used for typing variables, parameters, and function returns.

**Example**:
```typescript
// shared/src/types/User/index.ts
import { z } from "zod";
import { UserCreateSchema, UserGetSchema } from "../../schemas/User";

export type UserCreate = z.infer<typeof UserCreateSchema>;
export type UserGet = z.infer<typeof UserGetSchema>;
```

**Usage**:
```typescript
// Backend
async function createUser(user: UserCreate): Promise<UserGet> {
  // ...
}

// Frontend
const newUser: UserCreate = { email: "...", password: "...", ... };
```

### 3. The Three-Layer Type System

```
┌─────────────────────────────────────────────────────┐
│ Zod Schemas (schemas/)                              │
│ - Define validation logic                           │
│ - Runtime validation on frontend & backend          │
│ - DTO classes for NestJS/Swagger                    │
└─────────────────────────────────────────────────────┘
           ↓                           ↓
┌──────────────────────┐  ┌───────────────────────────┐
│ TypeScript Types     │  │ DTO Classes               │
│ (types/)             │  │ (schemas/)                │
│                      │  │                           │
│ type UserCreate = {  │  │ class UserCreateDTO       │
│   email: string;     │  │   extends createZodDto()  │
│   password: string;  │  │ {}                        │
│ }                    │  │                           │
│                      │  │ Used by NestJS/Swagger    │
│ Used in variables,   │  │ for API documentation     │
│ parameters, returns  │  │ and validation            │
└──────────────────────┘  └───────────────────────────┘
```

## Usage Examples

### Backend - Creating an API Endpoint

```typescript
import { ApiEndpoint } from "@backend/common/decorators";
import { UserCreateDTO, UserGetDTO } from "@vigilart/shared/schemas";

@Controller("users")
export class UsersController {
  @Post()
  @ApiEndpoint({
    summary: "Create a new user",
    success: { status: HttpStatus.CREATED, type: UserCreateDTO },
    errors: [HttpStatus.BAD_REQUEST, HttpStatus.CONFLICT],
    protected: true
  })
  async create(@Body() user: UserCreateDTO): Promise<UserGetDTO> {
    return this.usersService.create(user);
  }
}
```

**What happens**:
1. `UserCreateDto` class tells NestJS to validate request body against the Zod schema
2. Swagger automatically generates API documentation with correct request/response schemas
3. If validation fails, `ZodValidationPipe` catches it and returns proper error response

### Frontend - Form Validation

```typescript
import { UserCreateSchema } from "@vigilart/shared/schemas";
import type { UserCreate } from "@vigilart/shared/types";

function SignUpForm() {
  const [formData, setFormData] = useState<UserCreate>({
    email: "",
    password: "",
    firstName: "",
    lastName: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate using shared schema
    const result = UserCreateSchema.safeParse(formData);

    if (!result.success) {
      result.error.issues.forEach(issue => {
        console.error(`${issue.path.join(".")}: ${issue.message}`);
      });
      return;
    }

    // Data is valid, submit to API
    api.post("/users", formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      {/* ... other fields ... */}
      <button type="submit">Sign Up</button>
    </form>
  );
}
```

## Other Shared Exports

### Constants (`shared/src/constants/`)

Application-wide constants used across frontend and backend.

```typescript
import { MIN_PASSWORD_NUMBERS, MIN_PASSWORD_UPPERCASE } from "@vigilart/shared/constants";
```

### Enums (`shared/src/enums/`)

Shared enumerations for statuses, roles, subscription tiers, etc.

```typescript
import { SubscriptionTier, DmcaStatus } from "@vigilart/shared/enums";
```

### Functions (`shared/src/functions/`)

Utility functions that may be used in both frontend and backend.

```typescript
import { formatDate } from "@vigilart/shared/functions";
```

### Server export (`shared/src/server.ts`)

**Purpose**: Re-exports Prisma Client for server-side usage in the backend.

**Content**:
```typescript
export * from "./generated/prisma/client";
```

**Usage**: 
The `server.ts` file provides a clean export path for backend services to import the Prisma Client. This is particularly useful in the backend where you need to work with database types and the Prisma Client instance.

**Example**:
```typescript
// Backend usage
import { PrismaClient } from "@vigilart/shared/server";
import type { User } from "@vigilart/shared/types";

// Now you have access to Prisma Client types and client instance
const user: User = await prisma.user.findUnique(...);
```

**Note**: This file is **backend-only** and should not be imported by the frontend, as it includes server-side dependencies.

## Key Files and Naming Conventions

### Schema Files
- Located in `shared/src/schemas/{Feature}/`
- Name format: `{Entity}{Type}Schema` for schemas (e.g., `UserCreateSchema`, `DmcaNoticeGetSchema`)
- Name format: `{Entity}{Type}DTO` for DTO classes (e.g., `UserCreateDTO`, `DmcaNoticeGetDTO`)
- Both schemas and DTO classes exported from `index.ts` in each feature folder

### Type Files
- Located in `shared/src/types/{Feature}/`
- **TypeScript Types**: `type {Entity}{Type} = z.infer<...>` (e.g., `type UserGet`)
- Exported from `index.ts` in each feature folder

### Status Response Types
- `ApiResponse`: Base response wrapper
- `ApiSuccess<T>`: 200 success response
- `ApiCreated<T>`: 201 created response
- `ApiNoContent`: 204 no content response
- `ApiError`: Error response wrapper

## Best Practices

1. **Always use DTO classes from schemas**: Use DTO classes with NestJS decorators for Swagger documentation and validation
2. **Keep schemas and types in sync**: If you update a schema, update the corresponding type
3. **Use `z.infer<>` for types**: Don't manually write types that duplicate schema logic
4. **Validate on both sides**: Frontend validation for UX, backend validation for security
5. **Organize by feature**: Group related schemas and types in feature folders (User/, Dmca/, etc.)
6. **Export from index.ts**: Make it easy to import from schemas and types folders

## Summary

The shared module provides:
- ✅ **Single source of truth** for data validation and types
- ✅ **Type safety** across frontend and backend
- ✅ **Automatic API documentation** via Swagger
- ✅ **Code reusability** and reduced duplication
- ✅ **Consistent validation** on both client and server

By using schemas, types, and DTO classes together, the application maintains consistency, type safety, and reduces the chance of bugs caused by mismatched data structures.
