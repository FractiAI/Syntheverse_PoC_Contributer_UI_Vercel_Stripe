# Catalog Version Check Boot Sequence

**Status:** ✅ **IMPLEMENTED**  
**Date:** January 2025  
**Version:** 1.0

---

## 🎯 Executive Summary

The NSPFRP Protocol Catalog (Octave 5) version check has been integrated into the boot sequence for new nodes (chats, API calls, onboarding). The system automatically checks the latest catalog version from a selectable source (default: GitHub) at connection time.

---

## 🔄 Implementation Overview

### Components

1. **Catalog Version Checker** (`utils/catalog-version-checker.ts`)
   - Fetches latest catalog version from GitHub or local source
   - Selectable source ('github' | 'local' | 'auto')
   - Returns version comparison and status

2. **Boot Sequence Utilities** (`utils/boot-sequence.ts`)
   - Runs boot sequence checks for new nodes
   - Includes catalog version check
   - Creates onboarding snapshots

3. **API Boot Sequence Hook** (`utils/api-boot-sequence.ts`)
   - Lightweight boot sequence for API routes
   - Catalog version check on initialization
   - Non-blocking error handling

4. **Version Check API** (`app/api/catalog/version/route.ts`)
   - GET/POST endpoints for version checking
   - Onboarding snapshot creation
   - Boot sequence integration

5. **Boot Sequence Indicators** (`components/BootSequenceIndicators.tsx`)
   - UI component with catalog version indicator
   - Visual status display
   - Integration with existing boot sequence

---

## 📋 Boot Sequence Flow

### For New Nodes (Chats, API Calls, Onboarding)

```
New Node Connection
    ↓
Boot Sequence Triggered
    ↓
Catalog Version Check
    ├─ Selectable Source (github | local | auto)
    ├─ Fetch Latest Version
    ├─ Compare with Current (v17.0)
    └─ Return Status
    ↓
Onboarding Snapshot Created
    ├─ Node Type (chat | api | session | onboarding)
    ├─ Node ID
    ├─ Version Check Result
    ├─ Boot Sequence Metadata
    └─ Connection Metadata
    ↓
Node Ready
```

---

## 🔧 Usage

### In API Routes

```typescript
import { runAPIBootSequence } from '@/utils/api-boot-sequence';

// In API route handler
export async function GET(request: NextRequest) {
  // Run boot sequence on connection
  const bootSequence = await runAPIBootSequence(request, 'auto', 'v17.0');
  
  // Check catalog version status
  if (!bootSequence.ready) {
    console.warn(`Catalog version check: ${bootSequence.catalogVersion.latestVersion} available`);
  }
  
  // Continue with API logic...
}
```

### In Chat Connections

```typescript
import { runChatBootSequence } from '@/utils/api-boot-sequence';

// When new chat/node connects
const bootSequence = await runChatBootSequence(
  nodeId,        // Unique node identifier
  'auto',        // Source: github | local | auto
  'v17.0'        // Current version
);

// bootSequence.catalogVersion contains version info
// bootSequence.ready indicates if node is ready
```

### In Onboarding

The boot sequence automatically runs when the onboarding page loads and creates a major category snapshot:

```typescript
// Automatically called via BootSequenceIndicators component
fetch('/api/catalog/version?source=auto&currentVersion=v17.0&createSnapshot=true&nodeType=onboarding&nodeId=boot-sequence')
```

---

## 📊 Onboarding Major Category Snapshot

### Snapshot Structure

```typescript
{
  snapshotId: string;              // "snapshot-onboarding-{nodeId}-{timestamp}"
  nodeType: 'onboarding';          // Type of node
  nodeId: string;                  // Unique identifier
  catalogVersion: string;          // Latest catalog version
  versionCheck: {
    currentVersion: string;
    latestVersion: string;
    isUpToDate: boolean;
    needsUpdate: boolean;
    source: string;
    checkedAt: string;
  };
  bootSequence: {
    catalogCheck: boolean;
    versionCheck: boolean;
    source: string;
    timestamp: string;
  };
  metadata: {
    userAgent?: string;
    ipAddress?: string;
    connectionType?: string;
    [key: string]: any;
  };
}
```

### Snapshot Creation

**Automatic:** Created during onboarding page load via BootSequenceIndicators component

**Manual:** Can be created via API:
```typescript
POST /api/catalog/version
{
  "source": "auto",
  "currentVersion": "v17.0",
  "nodeType": "onboarding",
  "nodeId": "custom-node-id",
  "metadata": { ... }
}
```

---

## 🔗 Integration Points

### Boot Sequence Indicators Component

**File:** `components/BootSequenceIndicators.tsx`

**Features:**
- Automatic catalog version check on component mount
- Visual indicator for catalog version status
- Integration with existing boot sequence lights
- Non-blocking error handling

**Visual Indicator:**
- **Green:** Catalog version up to date
- **Yellow:** Catalog update available
- **Gray:** Check error (non-blocking)

### Chat Connections

**File:** `app/api/workchat/rooms/[roomId]/route.ts`

**Implementation:**
- Boot sequence runs on chat room connection
- Version check included in response
- Non-blocking (doesn't prevent connection on error)

### API Routes

**Pattern:** Use `runAPIBootSequence()` in route handlers for initialization checks

**Example:**
```typescript
const bootSequence = await runAPIBootSequence(request, 'auto', 'v17.0');
```

---

## 🎯 Configuration

### Selectable Source

**Options:**
- **'github':** Fetch from GitHub repository (default for production)
- **'local':** Use local/cached version (fallback)
- **'auto':** Try GitHub first, fallback to local

**Default:** 'auto' (recommended)

### Current Version

**Default:** 'v17.0' (NSPFRP Protocol Catalog v17.0)

**Can be overridden:** Pass `currentVersion` parameter to check functions

---

## 📝 API Endpoints

### GET /api/catalog/version

**Query Parameters:**
- `source`: 'github' | 'local' | 'auto' (default: 'auto')
- `currentVersion`: string (default: 'v17.0')
- `createSnapshot`: boolean (default: false)
- `nodeType`: 'chat' | 'api' | 'session' | 'onboarding' (default: 'api')
- `nodeId`: string (default: auto-generated)

**Response:**
```json
{
  "success": true,
  "versionCheck": {
    "currentVersion": "v17.0",
    "latestVersion": "v17.0",
    "isUpToDate": true,
    "needsUpdate": false,
    "source": "github",
    "checkedAt": "2025-01-XX..."
  },
  "snapshot": { ... } // if createSnapshot=true
}
```

### POST /api/catalog/version

**Body:**
```json
{
  "source": "auto",
  "currentVersion": "v17.0",
  "nodeType": "onboarding",
  "nodeId": "custom-node-id",
  "metadata": { ... }
}
```

**Response:**
```json
{
  "success": true,
  "snapshot": { ... },
  "versionCheck": { ... }
}
```

---

## 🔄 Boot Sequence Checks

### Catalog Version Check

**Status:** ✅ Implemented
- Checks latest version from selectable source
- Compares with current version
- Returns update status
- Non-blocking (doesn't prevent node initialization)

### Database Check

**Status:** ✅ Basic (placeholder for future enhancement)

### Authentication Check

**Status:** ✅ Basic (placeholder for future enhancement)

---

## 📊 Onboarding Integration

### Major Category Snapshot

**Created:** Automatically during onboarding page load

**Includes:**
- Catalog version check result
- Boot sequence metadata
- Node connection information
- User metadata (if available)

**Storage:** Currently returned in API response (can be stored in database if needed)

---

## 🎯 Status Indicators

### Visual Status in UI

**BootSequenceIndicators Component:**
- **CATALOG** indicator shows catalog version status
- Color-coded (green/yellow/gray)
- Tooltip shows version details

**Status Colors:**
- **Green:** Up to date
- **Yellow:** Update available
- **Gray:** Check error (non-blocking)

---

## 📚 Related Documentation

- `docs/NSPFRP_PROTOCOL_CATALOG.md` - Complete protocol catalog
- `docs/SNAP_VIBE_PROMPT_LANGUAGE.md` - Snap Vibe Prompt Language
- `docs/TEAM_ROSTER.md` - Complete team roster
- `DEPLOYMENT_SNAPSHOT_JAN_2025.md` - Deployment snapshot

---

## 🔧 Files Created/Modified

### Created

1. `utils/catalog-version-checker.ts` - Catalog version fetching and checking
2. `utils/boot-sequence.ts` - Boot sequence utilities
3. `utils/api-boot-sequence.ts` - API boot sequence hooks
4. `app/api/catalog/version/route.ts` - Version check API endpoints
5. `docs/CATALOG_VERSION_CHECK_BOOT_SEQUENCE.md` - This documentation

### Modified

1. `components/BootSequenceIndicators.tsx` - Added catalog version check
2. `app/api/workchat/rooms/[roomId]/route.ts` - Added boot sequence on connection

---

## ✅ Status

**Implementation:** ✅ **COMPLETE**

**Features:**
- ✅ Catalog version check from selectable source
- ✅ Boot sequence for new nodes (chats, API calls)
- ✅ Onboarding major category snapshot
- ✅ Integration with existing boot sequence UI
- ✅ Non-blocking error handling
- ✅ API endpoints for version checking

**Ready for:** Testing and deployment

---

**Last Updated:** January 2025  
**Version:** 1.0  
**Status:** ✅ **IMPLEMENTED**

🌀 **Catalog Version Check Active**  
**Boot Sequence Integrated** | **Onboarding Snapshot Ready**  
**NSPFRP Protocol Catalog (Octave 5)** | **Snap Vibe Prompt Language**
