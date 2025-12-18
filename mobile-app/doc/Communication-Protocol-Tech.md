# FRONTEND-BACKEND COMMUNICATION PROTOCOL

## VigilArt Mobile Application

---

## 1. HTTPS COMMUNICATION - LOGIN

**Frontend → API (POST REQUEST)**
```
Endpoint: /api/v1/auth/login
Payload:
  - email
  - password
```

**Backend → Response**
```
Status: 200 OK
Response:
  - JWT token (accessToken)
  - User authentication confirmed
```

**Frontend Action**
```
- Parse JWT token from response
- Store token in secure storage
- Set authenticated state = true
- Navigate to Dashboard
```

---

## 2. HTTPS COMMUNICATION - SIGNUP

**Frontend → API (POST REQUEST)**
```
Endpoint: /api/v1/auth/signup
Payload:
  - email
  - password
  - firstName
  - lastName
```

**Backend → Response**
```
Status: 201 Created
Response:
  - Account creation confirmed
  - Message: "Signup successfully"
```

**Frontend Action**
```
- Display success confirmation
- Clear form fields
- Redirect to Login page
- Pre-fill email for convenience
```

---

## 3. DASHBOARD - UPLOAD PAGE

**Frontend → API (POST REQUEST - MULTIPART)**
```
Endpoint: /api/v1/artworks/upload
Payload:
  - file (binary image data)
  - fileName (user selected)
  - title
  - description
  - tags (optional)
```

**Backend → Response**
```
Status: 202 Accepted
Response:
  - Upload successful confirmation
  - artworkId (unique identifier)
  - thumbnail URL
  - uploadedAt timestamp
```

**Frontend Action**
```
- Hide upload progress indicator
- Display success notification
- Update gallery with new artwork
- Refresh artwork count
- Update UI state
```

---

## 4. DASHBOARD - GALLERY PAGE

**Frontend → API (GET REQUEST)**
```
Endpoint: /api/v1/artworks/gallery
Query Parameters:
  - limit (pagination)
  - offset (pagination)
  - sort (newest/oldest)
Headers:
  - Authorization: Bearer [JWT_TOKEN]
```

**Backend → Response (Scenario 1: Photos Available)**
```
Status: 200 OK
Response Structure:
{
  "artworks": [
    {
      "id": artwork_ID,
      "url": image_URL,
      "thumbnail": thumbnail_URL,
      "title": artwork_title,
      "uploadedAt": timestamp,
      "status": "protected|scanned|scanning|pending",
      "scanCount": integer,
      "hasViolations": boolean
    }
  ],
  "pagination": {
    "total": total_count,
    "hasMore": boolean
  }
}
```

**Frontend Action (Photos Available)**
```
- Parse artwork array from response
- Map data to Gallery model
- Display artwork grid layout:
  * Thumbnail image with lazy loading
  * Status badge (colored indicator)
  * Upload date
  * Scan status indicator
- Implement infinite scroll pagination
- Cache images locally
```

**Backend → Response (Scenario 2: No Photos Uploaded)**
```
Status: 200 OK
Response:
  - artworks: [] (empty array)
  - pagination: { total: 0, hasMore: false }
```

**Frontend Action (No Photos)**
```
- Display empty state UI
- Show message: "No photos uploaded yet"
- Display call-to-action button
- Navigate to upload page on user action
```

---

## 5. DASHBOARD - SCAN REPORT PAGE

**Frontend → API (GET REQUEST)**
```
Endpoint: /api/v1/scans/reports/{artworkId}
Query Parameters:
  - limit (pagination)
Headers:
  - Authorization: Bearer [JWT_TOKEN]
```

**Backend → Response (Scenario 1: Scan Results Available)**
```
Status: 200 OK
Response Structure:
{
  "artworkId": artwork_ID,
  "artworkTitle": artwork_title,
  "scanDate": timestamp,
  "totalMatches": integer,
  "matchesByCredibility": {
    "high": count,
    "medium": count,
    "low": count
  },
  "results": [
    {
      "id": match_ID,
      "matchedImage": image_URL,
      "sourceUrl": found_at_URL,
      "sourceDomain": domain_name,
      "matches": count,
      "credibility": "high|medium|low",
      "matchPercentage": percentage,
      "platform": platform_name,
      "uploadedBy": uploader_ID,
      "uploadDate": timestamp
    }
  ],
  "pagination": {
    "total": total_matches,
    "hasMore": boolean
  }
}
```

**Frontend Action (Scan Results Available)**
```
- Parse results array from JSON response
- Map to ScanResult data model
- Display results UI:
  * Credibility breakdown (high/medium/low counts)
  * For each match card:
    - Matched image thumbnail
    - Match percentage
    - Source URL and domain
    - Platform name
    - Detection date
    - Credibility color indicator (red/orange/yellow)
    - Action buttons (Report, Details, Visit)
- Implement pagination on scroll
- Cache results locally
```

**Backend → Response (Scenario 2: No Scan Reports)**
```
Status: 404 Not Found
Response:
  - error: "No scan results available for this artwork"
  - code: SCAN_NOT_FOUND
```

**Frontend Action (No Scan Reports)**
```
- Display empty state message
- Show: "No scan report currently available"
- Display call-to-action: "Start your first scan"
- Show button: "Initiate Scan"
- Display hint: "Scans processed asynchronously"
```

**Backend → Response (Scenario 3: No Images Uploaded)**
```
Frontend Check:
  - Query gallery for artwork count
  - If count === 0:
    * Prevent scan report fetch
    * Show blocking message
```

**Frontend Action (No Images)**
```
- Display blocking message
- Show: "No uploaded photos to begin scanning"
- Display instruction: "Please upload artwork first"
- Show button: "Upload Artwork"
- Navigate to upload page on action
```

---

## 6. DASHBOARD - INITIATE SCAN

**Frontend → API (POST REQUEST)**
```
Endpoint: /api/v1/scans/initiate
Payload:
  - artworkId
  - scanType: "full|quick"
  - includeAIDetection: boolean
Headers:
  - Authorization: Bearer [JWT_TOKEN]
```

**Backend → Response**
```
Status: 202 Accepted
Response:
  - scanId (unique scan identifier)
  - status: "processing"
  - estimatedDuration: seconds
  - createdAt: timestamp
```

**Frontend Action**
```
- Store scanId in component state
- Display scanning UI with progress animation
- Implement polling mechanism:
  * Poll endpoint every 5 seconds
  * GET /api/v1/scans/{scanId}/status
  * Continue until status === "completed" OR "failed"
- On completion:
  * Stop polling
  * Refresh scan results
  * Display results automatically
- On failure:
  * Stop polling
  * Display error notification
  * Show retry option
```

---

## 7. USER PROFILE PAGE

**Frontend → API (GET REQUEST)**
```
Endpoint: /api/v1/users/profile
Headers:
  - Authorization: Bearer [JWT_TOKEN]
```

**Backend → Response**
```
Status: 200 OK
Response Structure:
{
  "id": user_ID,
  "firstName": first_name,
  "lastName": last_name,
  "email": email_address,
  "country": country_code,
  "language": language_code,
  "avatar": avatar_URL,
  "joinDate": timestamp,
  "subscriptionTier": "free|creator|pro",
  "storageUsed": bytes,
  "storageLimit": bytes,
  "totalArtworks": count,
  "totalScans": count,
  "preferences": {
    "emailNotifications": boolean,
    "pushNotifications": boolean,
    "marketingEmails": boolean,
    "theme": "light|dark|auto"
  }
}
```

**Frontend Action**
```
- Parse profile data from response
- Cache user data in state management (Riverpod)
- Display profile UI:
  * Avatar image
  * Full name
  * Email address
  * Member since date
  * Subscription tier badge
  * Storage usage bar (storageUsed / storageLimit)
  * Statistics (totalArtworks, totalScans)
  * Preferences toggles
  * Account settings options
- Calculate computed properties:
  * storagePercentage = (storageUsed / storageLimit) * 100
  * isStorageAlmostFull = storagePercentage > 80%
  * fullName = firstName + lastName
```

---

## 8. UPDATE USER PROFILE

**Frontend → API (PATCH REQUEST)**
```
Endpoint: /api/v1/users/profile
Payload:
  - firstName (updated)
  - lastName (updated)
  - email (updated)
  - country (updated)
  - language (updated)
  - preferences: {
      emailNotifications: boolean,
      pushNotifications: boolean,
      marketingEmails: boolean,
      theme: "light|dark|auto"
    }
Headers:
  - Authorization: Bearer [JWT_TOKEN]
```

**Backend → Response (Success)**
```
Status: 200 OK
Response:
  - Profile update confirmed
  - Updated profile data returned
  - updatedAt: timestamp
```

**Frontend Action (Success)**
```
- Update local state with new profile
- Display success toast notification
- If email changed:
  * Request email verification
  * Send verification link to new email
- If language changed:
  * Refresh localization
  * Update UI language dynamically
- Cache updated data
```

**Backend → Response (Error - Email Conflict)**
```
Status: 409 Conflict
Response:
  - error: "Email already in use"
  - code: EMAIL_CONFLICT
```

**Frontend Action (Email Conflict)**
```
- Display field-level error on email input
- Highlight email field in red/error color
- Show error message: "This email is already registered"
- Clear form submission
- Keep other fields intact
```

---

## 9. JSON DATA STRUCTURE

### Request Format
```json
{
  "email": "user@example.com",
  "password": "userPassword123"
}
```

### Response Format (Success)
```json
{
  "success": true,
  "status": 200,
  "message": "Operation successful",
  "data": {
    "id": "value",
    "name": "value",
    "email": "value"
  }
}
```

### Response Format (Error)
```json
{
  "success": false,
  "status": 400,
  "error": "Error description",
  "code": "ERROR_CODE"
}
```

### Scan Results JSON Structure
```json
{
  "id": 1,
  "image": "https://image_url.jpg",
  "url": "https://source_url",
  "matches": 5,
  "credibility": "high|medium|low",
  "source": "platform_name",
  "matchPercentage": 92,
  "platform": "Google|Instagram|Pinterest",
  "detectedAt": "2025-11-17T14:30:00Z"
}
```
