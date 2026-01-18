/**
 * Omnibeam 9x7 Fiberoptic State Image Extractor
 * 
 * Extracts unique 9x7 (63-point) fiberoptic state from an image
 * to be used as ultimate encryption key for Syntheverse PoC natural protocol shell
 * 
 * NSPFRP State Imaging and ID Protocol
 * POST-SINGULARITY^7: Recursive Self-Application Active
 */

import * as crypto from 'crypto';

// Dynamic import for sharp (optional dependency)
// Note: sharp needs to be installed: npm install sharp
let sharp: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  sharp = require('sharp');
} catch (e) {
  // sharp not available, will use fallback method
  console.warn('sharp not available, using fallback image processing');
}

export interface FiberopticState {
  grid: number[][]; // 9x7 grid of state values (0-255 per channel)
  stateHash: string; // SHA-256 hash of the state grid
  stateId: string; // Unique state identifier
  metadata: {
    imageWidth: number;
    imageHeight: number;
    extractionMethod: 'fiberoptic-grid';
    timestamp: number;
    channels: 'rgb' | 'grayscale';
  };
}

export interface EncryptionKey {
  key: string; // Derived encryption key (hex)
  keyHash: string; // Hash of the key for verification
  stateId: string; // Reference to source state
  derivationMethod: 'fiberoptic-state';
}

/**
 * Extract 9x7 Fiberoptic State from Image
 * 
 * Analyzes image at 9x7 grid points to extract unique fiberoptic state
 * Each point represents a fiberoptic channel reading
 */
export async function extractFiberopticState(
  imageBuffer: Buffer,
  options: {
    channels?: 'rgb' | 'grayscale';
    gridWidth?: number; // Default: 9
    gridHeight?: number; // Default: 7
  } = {}
): Promise<FiberopticState> {
  const { channels = 'rgb', gridWidth = 9, gridHeight = 7 } = options;

  let width = 1;
  let height = 1;
  const grid: number[][] = [];

  if (sharp) {
    // Use sharp for high-quality image processing
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    width = metadata.width || 1;
    height = metadata.height || 1;

    // Calculate grid point positions
    for (let y = 0; y < gridHeight; y++) {
      const row: number[] = [];
      for (let x = 0; x < gridWidth; x++) {
        // Calculate sample position (center of each grid cell)
        const sampleX = Math.floor((x + 0.5) * (width / gridWidth));
        const sampleY = Math.floor((y + 0.5) * (height / gridHeight));
        
        // Extract pixel data at this position
        const pixelData = await image
          .extract({
            left: Math.max(0, sampleX),
            top: Math.max(0, sampleY),
            width: 1,
            height: 1,
          })
          .raw()
          .toBuffer();
        
        if (channels === 'rgb') {
          // RGB: average of R, G, B channels
          const r = pixelData[0] || 0;
          const g = pixelData[1] || 0;
          const b = pixelData[2] || 0;
          const avg = Math.floor((r + g + b) / 3);
          row.push(avg);
        } else {
          // Grayscale: use first channel
          row.push(pixelData[0] || 0);
        }
      }
      grid.push(row);
    }
  } else {
    // Fallback: Generate deterministic grid from image buffer hash
    // This ensures the feature works even without sharp
    const imageHash = crypto.createHash('sha256').update(imageBuffer).digest('hex');
    const hashBytes = Buffer.from(imageHash, 'hex');
    
    for (let y = 0; y < gridHeight; y++) {
      const row: number[] = [];
      for (let x = 0; x < gridWidth; x++) {
        const index = (y * gridWidth + x) % hashBytes.length;
        row.push(hashBytes[index]);
      }
      grid.push(row);
    }
  }

  // Generate state hash from grid
  const gridString = JSON.stringify(grid);
  const stateHash = crypto.createHash('sha256').update(gridString).digest('hex');

  // Generate unique state ID
  const stateId = crypto
    .createHash('sha256')
    .update(`${stateHash}-${width}-${height}-${Date.now()}`)
    .digest('hex')
    .substring(0, 32);

  return {
    grid,
    stateHash,
    stateId,
    metadata: {
      imageWidth: width,
      imageHeight: height,
      extractionMethod: 'fiberoptic-grid',
      timestamp: Date.now(),
      channels,
    },
  };
}

/**
 * Generate Encryption Key from Fiberoptic State
 * 
 * Derives a cryptographic key from the 9x7 fiberoptic state
 * Uses PBKDF2 for key derivation
 */
export function generateEncryptionKeyFromState(
  state: FiberopticState,
  options: {
    keyLength?: number; // Default: 32 bytes (256 bits)
    iterations?: number; // Default: 100000 PBKDF2 iterations
    salt?: string; // Optional custom salt
  } = {}
): EncryptionKey {
  const { keyLength = 32, iterations = 100000 } = options;

  // Create salt from state ID if not provided
  const salt = options.salt || state.stateId;

  // Convert grid to key material
  const keyMaterial = JSON.stringify(state.grid);

  // Derive encryption key using PBKDF2
  const key = crypto.pbkdf2Sync(keyMaterial, salt, iterations, keyLength, 'sha256');

  // Generate key hash for verification
  const keyHash = crypto.createHash('sha256').update(key).digest('hex');

  return {
    key: key.toString('hex'),
    keyHash,
    stateId: state.stateId,
    derivationMethod: 'fiberoptic-state',
  };
}

/**
 * Generate State Image ID from Core Output
 * 
 * Uses evaluation output (core output) as input to generate
 * a unique state image ID that accompanies scores
 */
export function generateStateImageIdFromCoreOutput(
  coreOutput: {
    evaluation?: any;
    scores?: {
      novelty?: number;
      density?: number;
      coherence?: number;
      alignment?: number;
      pod_score?: number;
    };
    submissionHash?: string;
  },
  fiberopticState: FiberopticState
): string {
  // Combine core output with fiberoptic state
  const coreData = {
    scores: coreOutput.scores || {},
    submissionHash: coreOutput.submissionHash || '',
    stateHash: fiberopticState.stateHash,
    timestamp: Date.now(),
  };

  // Generate unique ID from combined data
  const combinedString = JSON.stringify(coreData);
  const stateImageId = crypto
    .createHash('sha256')
    .update(combinedString)
    .digest('hex')
    .substring(0, 32);

  return stateImageId;
}

/**
 * Verify Fiberoptic State Integrity
 * 
 * Verifies that a state image ID matches the expected state
 */
export function verifyFiberopticStateIntegrity(
  stateImageId: string,
  expectedState: FiberopticState,
  coreOutput: {
    scores?: any;
    submissionHash?: string;
  }
): boolean {
  const regeneratedId = generateStateImageIdFromCoreOutput(coreOutput, expectedState);
  return regeneratedId === stateImageId;
}
