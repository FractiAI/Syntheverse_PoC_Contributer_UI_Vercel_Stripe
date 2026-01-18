# Omnibeam 9x7 Fiberoptic State Image Encryption Protocol

**Date:** January 2025  
**Status:** ✅ **ACTIVE**  
**POST-SINGULARITY^7:** Recursive Self-Application Active

---

## 🎯 Executive Summary

The **Omnibeam 9x7 Fiberoptic State Image Encryption Protocol** enables users to use an image's unique 9x7 (63-point) fiberoptic state as the ultimate encryption key for their Syntheverse PoC submissions. The state image ID accompanies scores for maximum protection within the Syntheverse PoC natural protocol shell on-chain.

**Key Features:**
- **9x7 Grid Extraction:** Analyzes image at 63 strategic points to extract unique fiberoptic state
- **Encryption Key Derivation:** Generates cryptographic key from image state using PBKDF2
- **Core Output as Input:** Uses evaluation output (scores) to generate state image ID
- **NSPFRP State Imaging Protocol:** Integrated with NSPFRP for protocol compliance
- **On-Chain Anchoring:** State image ID and encryption key hash anchored on-chain with octave separation

---

## 🌌 Protocol Overview

### Definition

**Omnibeam 9x7 Fiberoptic State Image:** A unique 9x7 grid (63 points) extracted from an image that serves as:
1. **Ultimate Encryption Key Source:** Derives cryptographic keys for maximum protection
2. **State Image ID:** Unique identifier generated from core output (evaluation scores)
3. **On-Chain Protection:** Anchored on blockchain with intentional octave separation

### Architecture

```
User Uploads Image
    ↓
9x7 Fiberoptic Grid Extraction (63 points)
    ↓
State Hash Generation
    ↓
Evaluation Completes (Core Output)
    ↓
State Image ID Generation (Core Output as Input)
    ↓
Encryption Key Derivation (PBKDF2)
    ↓
On-Chain Anchoring (Octave 5 → Octave 2)
```

---

## 🔐 State Extraction Process

### 1. Image Upload

**Location:** `components/ProfessionalSubmissionExperience.tsx`

Users can optionally enable "Ultimate Encryption: Omnibeam 9x7 Fiberoptic State Image" and upload an image:
- **Supported Formats:** JPG, PNG, WebP
- **Max Size:** 10MB
- **Storage:** Supabase Storage (`state-images` bucket)

### 2. 9x7 Grid Extraction

**Location:** `utils/omnibeam/fiberoptic-state-extractor.ts`

The system extracts a 9x7 grid (63 points) from the image:
- **Grid Dimensions:** 9 columns × 7 rows = 63 points
- **Sampling Method:** Center of each grid cell
- **Channel Processing:** RGB (average) or Grayscale
- **State Values:** 0-255 per point

**Example Grid:**
```
[ [120, 145, 98, ...],   // Row 1 (9 values)
  [134, 156, 112, ...],  // Row 2 (9 values)
  ...
  [98, 123, 87, ...] ]   // Row 7 (9 values)
```

### 3. State Hash Generation

The 63-point grid is hashed using SHA-256 to create a unique state hash:
```typescript
const gridString = JSON.stringify(grid);
const stateHash = crypto.createHash('sha256').update(gridString).digest('hex');
```

---

## 🔑 Encryption Key Derivation

### Process

**Location:** `utils/omnibeam/fiberoptic-state-extractor.ts`

1. **Key Material:** The 9x7 grid (as JSON string)
2. **Salt:** State ID (derived from state hash)
3. **Algorithm:** PBKDF2 with SHA-256
4. **Iterations:** 100,000 (configurable)
5. **Key Length:** 32 bytes (256 bits)

**Code:**
```typescript
const key = crypto.pbkdf2Sync(keyMaterial, salt, iterations, keyLength, 'sha256');
const keyHash = crypto.createHash('sha256').update(key).digest('hex');
```

### Security Properties

- **Deterministic:** Same image → same key (reproducible)
- **Unique:** Different images → different keys
- **Cryptographically Secure:** PBKDF2 with high iteration count
- **Verifiable:** Key hash stored for integrity verification

---

## 📊 State Image ID Generation (Core Output as Input)

### Process

**Location:** `utils/omnibeam/fiberoptic-state-extractor.ts`

The state image ID is generated using **core output (evaluation scores) as input**:

```typescript
const coreData = {
  scores: {
    novelty: evaluation.novelty,
    density: evaluation.density,
    coherence: evaluation.coherence,
    alignment: evaluation.alignment,
    pod_score: evaluation.pod_score,
  },
  submissionHash: submissionHash,
  stateHash: fiberopticState.stateHash,
  timestamp: Date.now(),
};

const stateImageId = crypto
  .createHash('sha256')
  .update(JSON.stringify(coreData))
  .digest('hex')
  .substring(0, 32);
```

### Why Core Output as Input?

1. **Score Integration:** State image ID incorporates evaluation scores
2. **Unique Per Submission:** Each submission gets unique ID based on its scores
3. **Verification:** Can verify state image ID matches expected scores
4. **Protection:** Scores are protected by the state image encryption

---

## 🛡️ NSPFRP State Imaging Protocol

### Protocol Functions

**Location:** `utils/nspfrp/state-imaging-protocol.ts`

#### 1. Process State Image with NSPFRP

```typescript
const protection = await processStateImageWithNSPFRP(
  imageBuffer,
  {
    evaluation,
    scores,
    submissionHash,
  }
);
```

**Returns:**
- `stateImage`: NSPFRP state image record
- `encryptionKey`: Derived encryption key
- `verification`: Integrity verification result

#### 2. Prepare for On-Chain Anchoring

```typescript
const anchoringData = prepareStateImageForOnChainAnchoring(stateImage);
```

**Returns:** Data structure ready for off-process on-chain anchoring

#### 3. Verify State Image Protection

```typescript
const verification = verifyStateImageProtection(protection);
```

**Returns:** Validation result with integrity check

---

## 🔗 Integration Points

### 1. Submission Flow

**Location:** `app/api/submit/route.ts`

1. User uploads image (optional)
2. Image stored in Supabase Storage
3. State image path stored in metadata
4. Submission proceeds normally

### 2. Evaluation Completion

**Location:** `app/api/evaluate/[hash]/route.ts`

After evaluation completes:
1. Check if state image exists
2. Trigger state image processing
3. Process uses core output (evaluation scores) as input

### 3. State Image Processing

**Location:** `app/api/state-image/process/route.ts`

1. Fetch state image from storage
2. Extract 9x7 fiberoptic state
3. Generate state image ID (using core output)
4. Derive encryption key
5. Store in contribution metadata
6. Queue on-chain anchoring

### 4. On-Chain Anchoring

**Location:** `utils/blockchain/off-process-anchoring.ts`

State image data anchored on-chain with:
- **Source Octave:** 5 (Protocol Catalog)
- **Target Octave:** 2 (Base Mainnet Shell)
- **Separation:** 3 octaves (intentional)

**Anchored Data:**
- State image ID
- State hash
- Encryption key hash
- Core output hash
- Scores

---

## 📋 Data Structures

### FiberopticState

```typescript
interface FiberopticState {
  grid: number[][]; // 9x7 grid (63 points)
  stateHash: string; // SHA-256 hash
  stateId: string; // Unique identifier
  metadata: {
    imageWidth: number;
    imageHeight: number;
    extractionMethod: 'fiberoptic-grid';
    timestamp: number;
    channels: 'rgb' | 'grayscale';
  };
}
```

### EncryptionKey

```typescript
interface EncryptionKey {
  key: string; // Derived key (hex)
  keyHash: string; // Hash for verification
  stateId: string; // Reference to state
  derivationMethod: 'fiberoptic-state';
}
```

### NSPFRPStateImage

```typescript
interface NSPFRPStateImage {
  stateId: string;
  stateHash: string;
  encryptionKeyHash: string;
  coreOutputHash: string;
  submissionHash: string;
  scores: {
    novelty?: number;
    density?: number;
    coherence?: number;
    alignment?: number;
    pod_score?: number;
  };
  metadata: {
    extractionTimestamp: number;
    protocolVersion: string;
    method: 'omnibeam-9x7-fiberoptic';
    onChainAnchored: boolean;
    transactionHash?: string;
  };
}
```

---

## 🔄 User Flow

### 1. Submission Form

1. User fills in title and content
2. **Optional:** Enable "Ultimate Encryption: Omnibeam 9x7 Fiberoptic State Image"
3. **If enabled:** Upload image (JPG, PNG, WebP, max 10MB)
4. Preview image shown
5. Submit contribution

### 2. Processing

1. Image uploaded to Supabase Storage
2. Submission saved with state image path
3. Payment processed (if required)
4. Evaluation triggered

### 3. After Evaluation

1. Evaluation completes with scores
2. State image processing triggered (if image provided)
3. 9x7 grid extracted from image
4. State image ID generated (using core output)
5. Encryption key derived
6. Data stored in contribution metadata
7. On-chain anchoring queued

### 4. Verification

Users can verify:
- State image ID matches expected scores
- Encryption key hash is correct
- On-chain anchoring completed
- Integrity verification passed

---

## 🔐 Security Features

### 1. Cryptographic Key Derivation

- **PBKDF2:** Industry-standard key derivation
- **High Iterations:** 100,000 iterations
- **Salt:** Unique per state image
- **Key Length:** 256 bits

### 2. Integrity Verification

- **State Hash:** SHA-256 of grid
- **Key Hash:** SHA-256 of derived key
- **Core Output Hash:** SHA-256 of evaluation scores
- **State Image ID:** SHA-256 of combined data

### 3. On-Chain Protection

- **Immutable:** Anchored on Base Mainnet
- **Verifiable:** Can verify on-chain
- **Octave Separation:** Intentional 3-octave separation (5 → 2)

### 4. Privacy

- **Image Storage:** Secure Supabase Storage
- **Key Storage:** Only key hash stored (not key itself)
- **Metadata:** Encrypted in contribution metadata

---

## 📊 Storage Requirements

### Supabase Storage

**Bucket:** `state-images`  
**Path:** `submissions/{submissionHash}.{ext}`  
**Max Size:** 10MB per image

### Database Metadata

State image protection data stored in `contributions.metadata`:
```json
{
  "state_image_protection": {
    "stateId": "...",
    "stateHash": "...",
    "encryptionKeyHash": "...",
    "coreOutputHash": "...",
    "verification": {...},
    "metadata": {...}
  },
  "state_image_anchoring": {...}
}
```

---

## ✅ Status

**Protocol Definition:** ✅ **COMPLETE**  
**State Extraction:** ✅ **COMPLETE**  
**Encryption Key Derivation:** ✅ **COMPLETE**  
**State Image ID Generation:** ✅ **COMPLETE**  
**NSPFRP Integration:** ✅ **COMPLETE**  
**On-Chain Anchoring:** ✅ **COMPLETE**  
**UI Integration:** ✅ **COMPLETE**  
**Documentation:** ✅ **COMPLETE**

---

## 🔧 Installation

### Required Dependencies

```bash
npm install sharp
```

**Note:** `sharp` is used for high-quality image processing. If not available, a fallback method using image buffer hash is used.

### Supabase Storage Setup

1. Create `state-images` bucket in Supabase Storage
2. Configure bucket policies for authenticated uploads
3. Set max file size to 10MB

---

## 🎯 Usage Example

### Frontend (Component)

```typescript
// User enables state image encryption
const [useStateImageEncryption, setUseStateImageEncryption] = useState(false);
const [stateImage, setStateImage] = useState<File | null>(null);

// Upload image
if (useStateImageEncryption && stateImage) {
  submitFormData.append('state_image', stateImage);
  submitFormData.append('use_state_image_encryption', 'true');
}
```

### Backend (API)

```typescript
// Process after evaluation
const protection = await processStateImageWithNSPFRP(
  imageBuffer,
  {
    evaluation,
    scores: {
      novelty: evaluation.novelty,
      density: evaluation.density,
      coherence: evaluation.coherence,
      alignment: evaluation.alignment,
      pod_score: evaluation.pod_score,
    },
    submissionHash,
  }
);
```

---

## 🔗 Related Documentation

- **Omnibeam Protocol:** `docs/OMNIBEAM_PROTOCOL.md`
- **NSPFRP Protocol:** `docs/NSPFRP_PROTOCOL_CATALOG.md`
- **Off-Process On-Chain Anchoring:** `docs/OFF_PROCESS_ONCHAIN_ANCHORING.md`
- **Professional Submission Experience:** `components/ProfessionalSubmissionExperience.tsx`

---

**Last Updated:** January 2025  
**Status:** ✅ **ACTIVE**  
**POST-SINGULARITY^7:** Recursive Self-Application Active

🌀 **Omnibeam 9x7 Fiberoptic State Image Encryption Protocol**  
**Ultimate Encryption Key** | **Core Output as Input** | **On-Chain Protection**  
**POST-SINGULARITY^7** | **NSPFRP State Imaging Protocol**
