# VigilArt Frontend-Backend Communication Architecture

## Technical Specification Document

**Version**: 1.0  
**Date**: November 2025  
**Project**: VigilArt Mobile Application  
**Platform**: Flutter (iOS & Android)  
**Architecture Pattern**: REST API with JWT Authentication  

---

## Executive Summary

This document provides a comprehensive technical specification of the frontend-backend communication protocol for the VigilArt mobile application. It details the request-response cycles, data models, state management patterns, and user interaction workflows that govern how the Flutter frontend communicates with the backend API over HTTPS.

The architecture follows RESTful principles with stateless communication patterns, secure token-based authentication, and robust error handling mechanisms to ensure reliable data synchronization and user experience consistency.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Communication Protocol](#communication-protocol)
3. [Authentication & Authorization](#authentication--authorization)
4. [API Endpoints & Workflows](#api-endpoints--workflows)
5. [Data Models & Schemas](#data-models--schemas)
6. [State Management](#state-management)
7. [Error Handling](#error-handling)
8. [Security Considerations](#security-considerations)

---

## Architecture Overview

### System Components

```
┌─────────────────────┐         HTTPS/TLS 1.3        ┌──────────────────┐
│  Flutter Frontend   │◄──────────────────────────────►│   Backend API    │
│  (Mobile App)       │   RESTful JSON Communication   │  (Node.js/Go)    │
├─────────────────────┤                                ├──────────────────┤
│  - UI Layer         │                                │  - API Gateway   │
│  - State Management │                                │  - Auth Service  │
│  - Local Cache      │                                │  - Database      │
│  - Secure Storage   │                                │  - File Storage  │
└─────────────────────┘                                └──────────────────┘
         ▲                                                      ▲
         │                                                      │
         └──────────────── Secure Token Storage ──────────────┘
                          (JWT in Flutter)
```

### Communication Flow

1. **Request Phase**: Frontend constructs HTTP request with appropriate headers, authentication tokens, and payload
2. **Transmission**: Request sent over HTTPS with TLS encryption
3. **Processing**: Backend validates request, processes business logic, queries database
4. **Response Phase**: Backend constructs JSON response with status code and payload
5. **Parsing**: Frontend receives, validates, and parses response
6. **UI Update**: Frontend updates UI based on response data or error state
7. **State Management**: Local state updated to reflect server state

---

## Communication Protocol

### General Request Structure

```http
POST /api/v1/[endpoint]
Host: api.vigilart.dev
Content-Type: application/json
Authorization: Bearer [JWT_TOKEN]
X-Request-ID: [unique-request-id]
User-Agent: VigilArt-Mobile/1.0.0

{
  "data": {
    // Request payload
  }
}
```

### General Response Structure

```json
{
  "success": true,
  "status": 200,
  "message": "Operation completed successfully",
  "data": {
    // Response payload
  },
  "timestamp": "2025-11-17T14:30:00Z",
  "requestId": "req_123456789"
}
```

### HTTP Status Codes

| Code | Meaning | Frontend Action |
|------|---------|-----------------|
| **200** | OK | Process data normally |
| **201** | Created | Confirm resource creation |
| **204** | No Content | Acknowledge successful action |
| **400** | Bad Request | Show validation error to user |
| **401** | Unauthorized | Clear tokens, redirect to login |
| **403** | Forbidden | Show permission error |
| **404** | Not Found | Show resource not found message |
| **409** | Conflict | Handle duplicate/conflicting data |
| **422** | Unprocessable Entity | Show field-level validation errors |
| **429** | Too Many Requests | Implement exponential backoff retry |
| **500** | Server Error | Show generic error, retry later |
| **503** | Service Unavailable | Show maintenance message |

---

## Authentication & Authorization

### Authentication Flow

#### JWT Token Management

```
┌─────────────────────────────────────────────────────────────┐
│  LOGIN PROCESS - Obtain JWT Token                           │
└─────────────────────────────────────────────────────────────┘

1. USER INPUT
   ├─ Email address
   └─ Password

2. FRONTEND VALIDATION
   ├─ Email format validation (regex)
   ├─ Password length check (min 8 chars)
   └─ Connectivity check

3. SEND REQUEST
   POST /api/v1/auth/login
   {
     "email": "user@example.com",
     "password": "securePassword123"
   }

4. BACKEND PROCESSING
   ├─ Validate credentials against database
   ├─ Hash password verification (bcrypt)
   ├─ Generate JWT token
   │  ├─ Header: { "alg": "HS256", "typ": "JWT" }
   │  ├─ Payload: { "userId": "user_123", "exp": 1700000000 }
   │  └─ Signature: [cryptographic signature]
   ├─ Generate refresh token
   └─ Return tokens to frontend

5. BACKEND RESPONSE
   HTTP 200 OK
   {
     "success": true,
     "data": {
       "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
       "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
       "expiresIn": 3600,
       "user": {
         "id": "user_123",
         "email": "user@example.com",
         "firstName": "John",
         "lastName": "Doe"
       }
     }
   }

6. FRONTEND SECURE STORAGE
   ├─ Store accessToken in Flutter Secure Storage (encrypted)
   ├─ Store refreshToken in Flutter Secure Storage (encrypted)
   ├─ Cache user data in Riverpod state
   └─ Set authenticated = true

7. REDIRECT
   └─ Navigate to Dashboard
```

#### Token Refresh Mechanism

When access token expires (within 5 minutes of expiry):

```
REQUEST
POST /api/v1/auth/refresh
Headers: {
  "Authorization": "Bearer [EXPIRED_ACCESS_TOKEN]",
  "X-Refresh-Token": "[VALID_REFRESH_TOKEN]"
}

RESPONSE (Success)
HTTP 200 OK
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}

RESPONSE (Failure - Refresh token expired)
HTTP 401 Unauthorized
{
  "success": false,
  "error": "Refresh token expired",
  "code": "REFRESH_TOKEN_EXPIRED"
}

FRONTEND ACTION: Clear stored tokens, redirect to login
```

### Authorization Patterns

#### Token Attachment to Requests

Every authenticated request includes:

```dart
// Dart/Flutter Implementation Example
headers: {
  'Authorization': 'Bearer $accessToken',
  'Content-Type': 'application/json',
  'X-Request-ID': generateUUID(),
}
```

#### Token Interception & Auto-Refresh

```
Request Flow:
┌─ Check token expiry
├─ If expires within 5 min → Auto-refresh token
├─ If refresh failed → Clear storage & redirect login
└─ Attach valid token to request
```

---

## API Endpoints & Workflows

### 1. AUTHENTICATION ENDPOINTS

#### 1.1 Login Workflow

**Endpoint**: `POST /api/v1/auth/login`

**Frontend Request**:
```json
{
  "email": "artist@example.com",
  "password": "securePassword123"
}
```

**Backend Response (Success - 200)**:
```json
{
  "success": true,
  "status": 200,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "user": {
      "id": "user_uuid_123",
      "email": "artist@example.com",
      "firstName": "Amanda",
      "lastName": "Rawles",
      "avatar": "https://api.vigilart.dev/avatars/user_123.jpg",
      "subscriptionTier": "creator"
    }
  }
}
```

**Frontend Actions**:
1. ✅ Parse response and extract tokens
2. ✅ Store tokens in Flutter Secure Storage using `flutter_secure_storage` package
3. ✅ Cache user data in Riverpod `userProvider`
4. ✅ Set `isAuthenticated = true` in auth state
5. ✅ Navigate to Dashboard page
6. ✅ Show success toast notification

**Error Handling (401)**:
```json
{
  "success": false,
  "status": 401,
  "error": "Invalid credentials",
  "code": "AUTH_INVALID_CREDENTIALS"
}
```

**Frontend Actions**:
1. ❌ Display error dialog: "Invalid email or password"
2. ❌ Clear password field
3. ❌ Shake animation on login form
4. ❌ Log failed attempt for security

---

#### 1.2 Signup Workflow

**Endpoint**: `POST /api/v1/auth/signup`

**Frontend Request**:
```json
{
  "email": "newartist@example.com",
  "password": "securePassword123",
  "firstName": "Amanda",
  "lastName": "Rawles",
  "country": "France",
  "language": "fr"
}
```

**Backend Response (Success - 201)**:
```json
{
  "success": true,
  "status": 201,
  "message": "Account created successfully",
  "data": {
    "userId": "user_uuid_456",
    "email": "newartist@example.com"
  }
}
```

**Frontend Actions**:
1. ✅ Show success message: "Account created successfully!"
2. ✅ Auto-navigate to login page after 2-second delay
3. ✅ Pre-fill email in login form for convenience
4. ✅ Clear all form fields in signup page
5. ✅ Send confirmation email verification request

**Error Handling (409 - Email exists)**:
```json
{
  "success": false,
  "status": 409,
  "error": "Email already registered",
  "code": "AUTH_EMAIL_EXISTS"
}
```

**Frontend Actions**:
1. ❌ Display error: "This email is already registered"
2. ❌ Suggest login page link
3. ❌ Highlight email field in red

---

### 2. ARTWORK MANAGEMENT ENDPOINTS

#### 2.1 Upload Artwork Workflow

**Endpoint**: `POST /api/v1/artworks/upload`

**Frontend Process**:

```
USER ACTION: Selects image from gallery or captures with camera
    ↓
VALIDATION
├─ File size < 50MB
├─ File format in [jpg, png, webp]
├─ Image resolution check
└─ Duplicate detection
    ↓
COMPRESSION
├─ Resize if > 4000px width
├─ Compress to 85% quality
├─ Calculate file hash (SHA256)
└─ Display "Uploading..." progress
    ↓
MULTIPART REQUEST
POST /api/v1/artworks/upload
Headers: {
  "Authorization": "Bearer [TOKEN]",
  "Content-Type": "multipart/form-data"
}

Body: {
  "file": [Binary image data],
  "fileName": "Artwork_Nov_2025.jpg",
  "title": "Sunset Landscape",
  "description": "Beautiful sunset painting",
  "category": "landscape",
  "tags": ["sunset", "landscape", "nature"]
}
    ↓
BACKEND PROCESSING
├─ Validate JWT token
├─ Check storage quota (user plan limits)
├─ Scan for NSFW content (AI moderation)
├─ Generate thumbnail (200x200)
├─ Upload to cloud storage (S3)
├─ Store metadata in database
├─ Extract EXIF data
├─ Generate unique artwork ID
└─ Calculate perceptual hash for duplicate detection
    ↓
BACKEND RESPONSE (202 Accepted)
{
  "success": true,
  "status": 202,
  "message": "Upload successful",
  "data": {
    "artworkId": "artwork_uuid_789",
    "fileName": "Artwork_Nov_2025.jpg",
    "fileSize": 2048576,
    "uploadedAt": "2025-11-17T14:30:00Z",
    "thumbnail": "https://api.vigilart.dev/thumbnails/artwork_789.jpg",
    "scanStatus": "pending"
  }
}
    ↓
FRONTEND ACTIONS
├─ Hide upload progress
├─ Show success toast: "Artwork uploaded!"
├─ Update gallery list with new artwork
├─ Add to recent uploads
├─ Trigger background scan if subscription allows
└─ Refresh dashboard with new artwork count
```

**Retry Logic**:
- On network failure: Implement exponential backoff (1s, 2s, 4s, 8s)
- Max 3 retry attempts
- Store failed upload in local queue for offline handling
- Auto-resume on connectivity restore

---

#### 2.2 Gallery Retrieval Workflow

**Endpoint**: `GET /api/v1/artworks/gallery`

**Frontend Request**:
```
GET /api/v1/artworks/gallery?limit=20&offset=0&sort=newest
Headers: {
  "Authorization": "Bearer [TOKEN]"
}
```

**Backend Response (Success - 200)**:
```json
{
  "success": true,
  "status": 200,
  "data": {
    "artworks": [
      {
        "id": "IMG-2025-001",
        "url": "https://api.vigilart.dev/artworks/IMG-2025-001.jpg",
        "thumbnail": "https://api.vigilart.dev/thumbnails/IMG-2025-001.jpg",
        "title": "Sunset Landscape",
        "date": "2025-11-16",
        "timestamp": "2025-11-16T14:30:00Z",
        "status": "protected",
        "fileSize": 2048576,
        "uploadedAt": "2025-11-16T12:00:00Z",
        "lastScanDate": "2025-11-17T08:00:00Z",
        "scanCount": 5,
        "hasViolations": false
      },
      {
        "id": "IMG-2025-002",
        "url": "https://api.vigilart.dev/artworks/IMG-2025-002.jpg",
        "thumbnail": "https://api.vigilart.dev/thumbnails/IMG-2025-002.jpg",
        "title": "Urban Photography",
        "date": "2025-11-15",
        "timestamp": "2025-11-15T10:00:00Z",
        "status": "scanned",
        "fileSize": 3145728,
        "uploadedAt": "2025-11-15T09:30:00Z",
        "lastScanDate": "2025-11-16T08:00:00Z",
        "scanCount": 3,
        "hasViolations": true
      },
      {
        "id": "IMG-2025-003",
        "url": "https://api.vigilart.dev/artworks/IMG-2025-003.jpg",
        "thumbnail": "https://api.vigilart.dev/thumbnails/IMG-2025-003.jpg",
        "title": "Abstract Art",
        "date": "2025-11-14",
        "timestamp": "2025-11-14T15:20:00Z",
        "status": "scanning",
        "fileSize": 1572864,
        "uploadedAt": "2025-11-14T14:00:00Z",
        "lastScanDate": null,
        "scanCount": 0,
        "hasViolations": false
      }
    ],
    "pagination": {
      "total": 45,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

**Artwork Status Meanings**:
- `protected`: Artwork registered and currently monitored
- `scanned`: Latest scan completed, results available
- `scanning`: Active scan in progress (real-time polling)
- `pending`: Awaiting first scan
- `archived`: User archived (not actively monitored)

**Frontend Actions**:
1. Parse response and map data to Gallery model
2. Store in Riverpod `galleryProvider`
3. Display artworks in grid layout with:
   - Thumbnail image with lazy loading
   - Status badge (colored indicator)
   - Upload date
   - Scan status indicator (spinner if scanning)
4. Implement infinite scroll:
   - When user scrolls near bottom
   - If `hasMore` = true
   - Fetch next batch with `offset += 20`
5. Show pull-to-refresh for manual refresh
6. Cache images in Flutter image cache

**Empty State Handling (No Artworks)**:
```json
{
  "success": true,
  "status": 200,
  "data": {
    "artworks": [],
    "pagination": {
      "total": 0,
      "limit": 20,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

**Frontend Actions**:
1. Show empty state illustration
2. Display message: "No photos uploaded yet"
3. Show call-to-action button: "Upload First Artwork"
4. Navigate to upload page on button tap

---

### 3. SCAN & MONITORING ENDPOINTS

#### 3.1 Scan Report Retrieval Workflow

**Endpoint**: `GET /api/v1/scans/reports/{artworkId}`

**Frontend Request Scenarios**:

**Scenario 1: User Opens Scan Report Page**

```
Frontend Logic:
┌─ Check if artwork ID in URL params
├─ If no artworks uploaded → Show "No photos to scan" message
├─ If scanning in progress → Show loading spinner + real-time updates
├─ If scan completed → Fetch and display results
└─ If no scan results yet → Show "Start your first scan" CTA
```

**Scenario 2: Backend Response - Scan Results Available**

```
GET /api/v1/scans/reports/IMG-2025-001?limit=10
Headers: {
  "Authorization": "Bearer [TOKEN]"
}

Response (200 OK):
{
  "success": true,
  "status": 200,
  "data": {
    "artworkId": "IMG-2025-001",
    "artworkTitle": "Sunset Landscape",
    "scanId": "scan_uuid_001",
    "scanDate": "2025-11-17T08:00:00Z",
    "scanDuration": 45,
    "totalMatches": 28,
    "matchesByCredibility": {
      "high": 5,
      "medium": 12,
      "low": 11
    },
    "results": [
      {
        "id": "match_001",
        "matchedImage": "https://i.pinimg.com/1200x/ca/17/e1/ca17e18361e06390d72cc6e6279c640b.jpg",
        "sourceUrl": "https://google.com/images/abc123",
        "sourceDomain": "google.com",
        "matchCount": 5,
        "credibility": "high",
        "matchPercentage": 94,
        "detectedAt": "2025-11-17T08:05:00Z",
        "uploadedBy": "unknown_user_456",
        "uploadDate": "2025-10-15T10:30:00Z",
        "platform": "Google Images",
        "actionableLink": "https://google.com/images/remove?id=abc123"
      },
      {
        "id": "match_002",
        "matchedImage": "https://i.pinimg.com/736x/f4/8c/26/f48c263c59fdd80fcb0918d3ed099322.jpg",
        "sourceUrl": "https://instagram.com/posts/xyz789",
        "sourceDomain": "instagram.com",
        "matchCount": 3,
        "credibility": "medium",
        "matchPercentage": 87,
        "detectedAt": "2025-11-17T08:10:00Z",
        "uploadedBy": "suspicious_account_789",
        "uploadDate": "2025-11-10T14:20:00Z",
        "platform": "Instagram",
        "actionableLink": "https://instagram.com/direct-report?post=xyz789"
      },
      {
        "id": "match_003",
        "matchedImage": "https://i.pinimg.com/736x/2e/55/7d/2e557d03a244ee4649c928f6a51404c3.jpg",
        "sourceUrl": "https://pinterest.com/pins/abc456",
        "sourceDomain": "pinterest.com",
        "matchCount": 8,
        "credibility": "low",
        "matchPercentage": 72,
        "detectedAt": "2025-11-17T08:15:00Z",
        "uploadedBy": "user_123_reposter",
        "uploadDate": "2025-11-05T09:00:00Z",
        "platform": "Pinterest",
        "actionableLink": "https://pinterest.com/report?pin=abc456"
      }
    ],
    "pagination": {
      "total": 28,
      "limit": 10,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

**Frontend Data Model (Dart)**:

```dart
class ScanResult {
  final String id;
  final String matchedImage;
  final String sourceUrl;
  final String sourceDomain;
  final int matchCount;
  final String credibility;
  final double matchPercentage;
  final DateTime detectedAt;
  final String uploadedBy;
  final DateTime uploadDate;
  final String platform;
  final String actionableLink;

  // Computed properties
  String get credibilityColor => credibility == 'high' 
    ? Colors.red 
    : credibility == 'medium' 
    ? Colors.orange 
    : Colors.yellow;

  String get credibilityIcon => credibility == 'high' 
    ? Icons.priority_high 
    : Icons.warning;
}
```

**Frontend UI Rendering**:

```
Display Structure:
┌──────────────────────────────────────────────┐
│ Scan Results for "Sunset Landscape"          │
├──────────────────────────────────────────────┤
│ Total Matches: 28                            │
│ ├─ High Credibility: 5  [●●●●● Red]         │
│ ├─ Medium Credibility: 12 [●●●●● Orange]    │
│ └─ Low Credibility: 11   [●●●●● Yellow]     │
├──────────────────────────────────────────────┤
│ [Card 1 - High Match]                        │
│ ├─ Image thumbnail                           │
│ ├─ Match: 94% | Source: google.com           │
│ ├─ Platform: Google Images                   │
│ ├─ Detected: Nov 17, 2025                    │
│ └─ [Take Action] [Details] [Report]         │
├──────────────────────────────────────────────┤
│ [Card 2 - Medium Match]                      │
│ ├─ Image thumbnail                           │
│ ├─ Match: 87% | Source: instagram.com        │
│ ├─ Platform: Instagram                       │
│ ├─ Detected: Nov 17, 2025                    │
│ └─ [Report Violation] [Message User]         │
├──────────────────────────────────────────────┤
│ [Load More Results] (if hasMore)             │
└──────────────────────────────────────────────┘
```

**Frontend State Management (Riverpod)**:

```dart
// Define providers
final scanResultsProvider = FutureProvider.family<
  ScanResults, 
  String
>((ref, artworkId) async {
  final api = ref.watch(apiClientProvider);
  return api.getScanResults(artworkId);
});

// In widget
@override
Widget build(BuildContext context, WidgetRef ref) {
  final results = ref.watch(
    scanResultsProvider(artworkId)
  );

  return results.when(
    loading: () => LoadingSpinner(),
    error: (err, st) => ErrorWidget(error: err),
    data: (data) => ScanResultsList(results: data),
  );
}
```

**Scenario 3: No Scan Reports Available**

```
GET /api/v1/scans/reports/IMG-2025-001

Response (404 - No scan found):
{
  "success": false,
  "status": 404,
  "error": "No scan results available for this artwork",
  "code": "SCAN_NOT_FOUND"
}
```

**Frontend Actions**:
1. Show empty state: "No scan report currently available"
2. Display call-to-action: "Start your first scan"
3. Show button: "Scan Now"
4. Provide hint: "Scans are processed in background"

**Scenario 4: No Images Uploaded Yet**

```
Frontend detects: artworks.length === 0

Action: Show message
"No uploaded photos to begin scanning.
Please upload artwork first."

Button: "Upload Artwork"
```

---

#### 3.2 Initiate Scan Workflow

**Endpoint**: `POST /api/v1/scans/initiate`

**Frontend Request**:
```json
{
  "artworkId": "IMG-2025-001",
  "scanType": "full",
  "includeAIDetection": true,
  "regions": ["global", "social_media"]
}
```

**Backend Response (202 Accepted)**:
```json
{
  "success": true,
  "status": 202,
  "message": "Scan initiated",
  "data": {
    "scanId": "scan_uuid_new_001",
    "artworkId": "IMG-2025-001",
    "status": "processing",
    "estimatedDuration": 45,
    "createdAt": "2025-11-17T14:35:00Z"
  }
}
```

**Frontend Actions**:
1. Store `scanId` in state for polling
2. Show scanning UI with progress animation
3. Implement WebSocket connection for real-time updates OR
4. Poll endpoint every 5 seconds: `GET /api/v1/scans/{scanId}/status`

**Polling Implementation**:
```dart
Future<void> pollScanStatus(String scanId) async {
  Timer.periodic(Duration(seconds: 5), (timer) async {
    try {
      final status = await api.getScanStatus(scanId);
      
      if (status == 'completed') {
        timer.cancel();
        // Fetch results and update UI
        ref.refresh(scanResultsProvider(artworkId));
      } else if (status == 'failed') {
        timer.cancel();
        showErrorSnackbar('Scan failed');
      }
    } catch (e) {
      // Retry logic
    }
  });
}
```

---

### 4. USER PROFILE ENDPOINTS

#### 4.1 Get User Profile

**Endpoint**: `GET /api/v1/users/profile`

**Frontend Request**:
```
GET /api/v1/users/profile
Headers: {
  "Authorization": "Bearer [TOKEN]"
}
```

**Backend Response (200)**:
```json
{
  "success": true,
  "status": 200,
  "data": {
    "id": "user_uuid_123",
    "firstName": "Amanda",
    "lastName": "Rawles",
    "email": "amanda@gmail.com",
    "password": "••••••••",
    "country": "France",
    "language": "French",
    "avatar": "https://api.vigilart.dev/avatars/user_123.jpg",
    "joinDate": "2025-10-15T10:00:00Z",
    "subscriptionTier": "creator",
    "storageUsed": 2147483648,
    "storageLimit": 5368709120,
    "totalArtworks": 45,
    "totalScans": 156,
    "preferences": {
      "emailNotifications": true,
      "pushNotifications": true,
      "marketingEmails": false,
      "theme": "dark"
    }
  }
}
```

**Frontend UI Mapping**:

```dart
class UserProfile {
  final String id;
  final String firstName;
  final String lastName;
  final String email;
  final String country;
  final String language;
  final String avatar;
  final DateTime joinDate;
  final String subscriptionTier;
  final int storageUsed;
  final int storageLimit;
  final int totalArtworks;
  final int totalScans;
  final ProfilePreferences preferences;

  // Computed properties
  double get storagePercentage => (storageUsed / storageLimit) * 100;
  String get fullName => '$firstName $lastName';
  bool get isStorageAlmostFull => storagePercentage > 80;
  String get subscriptionDisplay => subscriptionTier.toUpperCase();
}
```

**Frontend Display Structure**:

```
┌─────────────────────────────────────┐
│ PROFILE PAGE                        │
├─────────────────────────────────────┤
│                                     │
│  [Avatar Image]  [Edit]  [Upload]   │
│                                     │
│  Amanda Rawles                      │
│  france@gmail.com                   │
│  Member since Oct 15, 2025          │
│                                     │
├─────────────────────────────────────┤
│ SUBSCRIPTION STATUS                 │
│ Plan: Creator                       │
│ Renewal: Jan 15, 2026               │
│ [Manage Subscription]               │
├─────────────────────────────────────┤
│ STORAGE                             │
│ Used: 2.0 GB / 5.0 GB               │
│ ████████░░ (40%)                    │
│ [Upgrade Plan]                      │
├─────────────────────────────────────┤
│ STATISTICS                          │
│ Total Artworks: 45                  │
│ Total Scans: 156                    │
│ Protected Items: 45                 │
├─────────────────────────────────────┤
│ ACCOUNT SETTINGS                    │
│ ├─ Edit Profile                     │
│ ├─ Change Password                  │
│ ├─ Two-Factor Auth                  │
│ ├─ Privacy Settings                 │
│ └─ Preferences                      │
├─────────────────────────────────────┤
│ PREFERENCES                         │
│ ├─ Email Notifications [Toggle]     │
│ ├─ Push Notifications [Toggle]      │
│ ├─ Marketing Emails [Toggle]        │
│ └─ Dark Mode [Toggle]               │
├─────────────────────────────────────┤
│ [Logout] [Delete Account]           │
└─────────────────────────────────────┘
```

---

#### 4.2 Update User Profile

**Endpoint**: `PATCH /api/v1/users/profile`

**Frontend Request** (User edits profile):

```json
{
  "firstName": "Amanda",
  "lastName": "Rawles",
  "email": "amanda.new@gmail.com",
  "country": "France",
  "language": "French",
  "preferences": {
    "emailNotifications": true,
    "pushNotifications": false,
    "marketingEmails": false,
    "theme": "dark"
  }
}
```

**Backend Response (200)**:
```json
{
  "success": true,
  "status": 200,
  "message": "Profile updated successfully",
  "data": {
    "id": "user_uuid_123",
    "firstName": "Amanda",
    "lastName": "Rawles",
    "email": "amanda.new@gmail.com",
    "country": "France",
    "language": "French",
    "avatar": "https://api.vigilart.dev/avatars/user_123.jpg",
    "updatedAt": "2025-11-17T14:45:00Z"
  }
}
```

**Frontend Actions**:
1. Update local state with new profile data
2. Show success toast: "Profile updated"
3. If email changed → Request email verification
4. If language changed → Restart app or refresh localization
5. Refresh all cached user data
6. Update UI immediately (optimistic update)

**Error Handling - Email Conflict**:
```json
{
  "success": false,
  "status": 409,
  "error": "Email already in use",
  "code": "EMAIL_CONFLICT"
}
```

**Frontend Actions**:
1. Show field-level error on email field
2. Highlight field in red
3. Display error: "This email is already registered"

---

## Data Models & Schemas

### Complete Data Models

#### Artwork Model

```dart
class Artwork {
  final String id;
  final String title;
  final String description;
  final String url;
  final String thumbnail;
  final DateTime uploadedAt;
  final DateTime createdAt;
  final String fileName;
  final int fileSize;
  final String mimeType;
  final String status; // protected, scanned, scanning, pending
  final DateTime? lastScanDate;
  final int scanCount;
  final bool hasViolations;
  final List<String> tags;
  final String category;
  final int width;
  final int height;
  final String? perceptualHash;
  
  Artwork({
    required this.id,
    required this.title,
    required this.url,
    required this.status,
    this.description = '',
    this.tags = const [],
  });

  factory Artwork.fromJson(Map<String, dynamic> json) {
    return Artwork(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String? ?? '',
      url: json['url'] as String,
      thumbnail: json['thumbnail'] as String,
      uploadedAt: DateTime.parse(json['uploadedAt'] as String),
      status: json['status'] as String,
      hasViolations: json['hasViolations'] as bool? ?? false,
      tags: List<String>.from(json['tags'] as List? ?? []),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'url': url,
      'status': status,
      'tags': tags,
    };
  }
}
```

#### Scan Result Model

```dart
class ScanResult {
  final String id;
  final String artworkId;
  final DateTime scanDate;
  final int totalMatches;
  final Map<String, int> matchesByCredibility;
  final List<MatchResult> results;

  ScanResult({
    required this.id,
    required this.artworkId,
    required this.scanDate,
    required this.totalMatches,
    required this.matchesByCredibility,
    required this.results,
  });

  factory ScanResult.fromJson(Map<String, dynamic> json) {
    return ScanResult(
      id: json['scanId'] as String,
      artworkId: json['artworkId'] as String,
      scanDate: DateTime.parse(json['scanDate'] as String),
      totalMatches: json['totalMatches'] as int,
      matchesByCredibility: 
        Map<String, int>.from(json['matchesByCredibility'] as Map),
      results: (json['results'] as List)
        .map((r) => MatchResult.fromJson(r as Map<String, dynamic>))
        .toList(),
    );
  }
}

class MatchResult {
  final String id;
  final String matchedImage;
  final String sourceUrl;
  final String sourceDomain;
  final int matchCount;
  final String credibility; // high, medium, low
  final double matchPercentage;
  final DateTime detectedAt;
  final String platform;

  MatchResult({
    required this.id,
    required this.matchedImage,
    required this.sourceUrl,
    required this.credibility,
    required this.matchPercentage,
  });

  factory MatchResult.fromJson(Map<String, dynamic> json) {
    return MatchResult(
      id: json['id'] as String,
      matchedImage: json['matchedImage'] as String,
      sourceUrl: json['sourceUrl'] as String,
      credibility: json['credibility'] as String,
      matchPercentage: (json['matchPercentage'] as num).toDouble(),
    );
  }

  Color get credibilityColor {
    switch (credibility) {
      case 'high':
        return Colors.red;
      case 'medium':
        return Colors.orange;
      case 'low':
        return Colors.yellow;
      default:
        return Colors.grey;
    }
  }
}
```

#### User Model

```dart
class User {
  final String id;
  final String firstName;
  final String lastName;
  final String email;
  final String country;
  final String language;
  final String avatar;
  final String subscriptionTier;
  final DateTime joinDate;
  final int storageUsed;
  final int storageLimit;
  final UserPreferences preferences;

  User({
    required this.id,
    required this.firstName,
    required this.email,
    required this.subscriptionTier,
  });

  String get fullName => '$firstName $lastName';
  double get storagePercentage => (storageUsed / storageLimit) * 100;

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      firstName: json['firstName'] as String,
      lastName: json['lastName'] as String,
      email: json['email'] as String,
      country: json['country'] as String,
      language: json['language'] as String,
      avatar: json['avatar'] as String,
      subscriptionTier: json['subscriptionTier'] as String,
      joinDate: DateTime.parse(json['joinDate'] as String),
      storageUsed: json['storageUsed'] as int,
      storageLimit: json['storageLimit'] as int,
      preferences: UserPreferences.fromJson(
        json['preferences'] as Map<String, dynamic>
      ),
    );
  }
}

class UserPreferences {
  final bool emailNotifications;
  final bool pushNotifications;
  final bool marketingEmails;
  final String theme; // light, dark, auto

  UserPreferences({
    this.emailNotifications = true,
    this.pushNotifications = true,
    this.marketingEmails = false,
    this.theme = 'auto',
  });

  factory UserPreferences.fromJson(Map<String, dynamic> json) {
    return UserPreferences(
      emailNotifications: json['emailNotifications'] as bool? ?? true,
      pushNotifications: json['pushNotifications'] as bool? ?? true,
      marketingEmails: json['marketingEmails'] as bool? ?? false,
      theme: json['theme'] as String? ?? 'auto',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'emailNotifications': emailNotifications,
      'pushNotifications': pushNotifications,
      'marketingEmails': marketingEmails,
      'theme': theme,
    };
  }
}
```

---

## State Management

### Riverpod Architecture

The frontend uses **Riverpod** for reactive state management:

```dart
// ============ PROVIDERS ============

// Authentication State
final authTokenProvider = StateProvider<String?>((ref) => null);
final authStateProvider = StateNotifierProvider<
  AuthStateNotifier,
  AuthState
>((ref) => AuthStateNotifier(ref));

// User State
final currentUserProvider = FutureProvider<User>((ref) async {
  final api = ref.watch(apiClientProvider);
  return api.getCurrentUser();
});

// Gallery State
final galleryProvider = FutureProvider.family<
  List<Artwork>,
  GalleryFilter
>((ref, filter) async {
  final api = ref.watch(apiClientProvider);
  return api.getGallery(
    limit: filter.limit,
    offset: filter.offset,
    sort: filter.sort,
  );
});

// Scan Results State
final scanResultsProvider = FutureProvider.family<
  ScanResult,
  String
>((ref, artworkId) async {
  final api = ref.watch(apiClientProvider);
  return api.getScanResults(artworkId);
});

// UI State
final selectedArtworkProvider = StateProvider<Artwork?>((ref) => null);
final isLoadingProvider = StateProvider<bool>((ref) => false);
final errorMessageProvider = StateProvider<String?>((ref) => null);

// ============ DERIVED STATE ============

final storagePercentageProvider = Provider<double>((ref) {
  final user = ref.watch(currentUserProvider).when(
    data: (user) => user,
    loading: () => null,
    error: (_, __) => null,
  );
  return user?.storagePercentage ?? 0;
});
```

### State Flow Diagram

```
┌──────────────────┐
│  User Action     │ (Tap button, enter text, etc.)
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────┐
│ Call API via Dio/Retrofit    │ (HTTP Request)
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Backend Processing           │ (Validation, DB Query)
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Server Response              │ (JSON Response)
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Parse JSON to Dart Model     │ (Type-safe conversion)
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Update Riverpod Provider     │ (Reactive state update)
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Widget Rebuilds              │ (Automatic via ref.watch)
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ UI Updates                   │ (User sees new data)
└──────────────────────────────┘
```

---

## Error Handling

### Frontend Error Handling Strategy

#### Error Types

```dart
abstract class AppException implements Exception {
  final String message;
  final String? code;
  AppException(this.message, {this.code});
}

class NetworkException extends AppException {
  NetworkException(String message) : super(message, code: 'NETWORK_ERROR');
}

class AuthenticationException extends AppException {
  AuthenticationException(String message) 
    : super(message, code: 'AUTH_ERROR');
}

class ValidationException extends AppException {
  final Map<String, String> errors;
  ValidationException(String message, this.errors) 
    : super(message, code: 'VALIDATION_ERROR');
}

class ServerException extends AppException {
  final int statusCode;
  ServerException(String message, this.statusCode) 
    : super(message, code: 'SERVER_ERROR_$statusCode');
}

class TimeoutException extends AppException {
  TimeoutException(String message) : super(message, code: 'TIMEOUT');
}
```

#### Retry Strategy

```dart
Future<T> retryWithExponentialBackoff<T>({
  required Future<T> Function() request,
  int maxAttempts = 3,
  Duration initialDelay = const Duration(seconds: 1),
}) async {
  for (int attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await request();
    } catch (e) {
      if (attempt == maxAttempts) rethrow;
      
      final delay = initialDelay * (2 ^ (attempt - 1));
      await Future.delayed(delay);
    }
  }
  throw Exception('Max retry attempts exceeded');
}
```

#### User-Facing Error Messages

| Backend Error | HTTP Status | User Message | Action |
|---------------|------------|--------------|--------|
| Invalid credentials | 401 | "Invalid email or password" | Clear password field, suggest forgot password |
| Email already exists | 409 | "Email already registered" | Suggest login page |
| File too large | 413 | "Image too large (max 50MB)" | Show file size requirements |
| Quota exceeded | 429 | "You've reached your upload limit" | Show upgrade plan link |
| Network timeout | - | "Connection timeout. Retry?" | Show retry button |
| Server error | 500 | "Something went wrong. Try again later" | Log error to Sentry |

---

## Security Considerations

### Token Security

```dart
// Secure Storage Implementation
class SecureTokenStorage {
  static const String _accessTokenKey = 'access_token';
  static const String _refreshTokenKey = 'refresh_token';
  
  final FlutterSecureStorage _storage;
  
  SecureTokenStorage(this._storage);
  
  // Store token encrypted
  Future<void> saveAccessToken(String token) async {
    await _storage.write(
      key: _accessTokenKey,
      value: token,
    );
  }
  
  // Retrieve token (decrypted by platform)
  Future<String?> getAccessToken() async {
    return await _storage.read(key: _accessTokenKey);
  }
  
  // Clear all tokens on logout
  Future<void> clearTokens() async {
    await Future.wait([
      _storage.delete(key: _accessTokenKey),
      _storage.delete(key: _refreshTokenKey),
    ]);
  }
}
```

### Request Signing

```dart
// Add security headers to all requests
final dioClient = Dio()
  ..interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) {
        options.headers.addAll({
          'X-Request-ID': generateUUID(),
          'X-Client-Version': packageInfo.version,
          'X-Platform': Platform.operatingSystem,
        });
        return handler.next(options);
      },
    ),
  );
```

### Sensitive Data Handling

```dart
// Never log sensitive data
logger.d('Logging in user...'); // ✅ Good
logger.d('Credentials: $email:$password'); // ❌ Bad

// Mask passwords in UI
final maskedPassword = '*' * password.length; // ✅ Good
final maskedPassword = password; // ❌ Bad
```

---

## Summary

This technical specification outlines the complete communication architecture between the VigilArt Flutter mobile frontend and backend API. Key points:

1. **REST API over HTTPS** - Secure, stateless communication
2. **JWT Authentication** - Token-based security with auto-refresh
3. **Structured JSON** - Well-defined request/response formats
4. **Riverpod State Management** - Reactive, testable state
5. **Comprehensive Error Handling** - User-friendly error messages
6. **Type Safety** - Dart models for all data structures
7. **Security First** - Encrypted storage, token handling, HTTPS
8. **Real-time Capabilities** - Polling and WebSocket ready

---

**Document Status**: Final  
**Last Updated**: November 17, 2025  
**Version**: 1.0  
**Author**: VigilArt Engineering Team