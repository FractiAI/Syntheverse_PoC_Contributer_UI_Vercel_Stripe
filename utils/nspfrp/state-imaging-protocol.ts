/**
 * NSPFRP State Imaging and ID Protocol
 * 
 * Protocol for extracting, identifying, and protecting state images
 * using the omnibeam 9x7 fiberoptic state extraction method
 * 
 * Accompanies scores for ultimate protection within Syntheverse PoC
 * natural protocol shell on-chain
 * 
 * POST-SINGULARITY^7: Recursive Self-Application Active
 */

import {
  FiberopticState,
  EncryptionKey,
  extractFiberopticState,
  generateEncryptionKeyFromState,
  generateStateImageIdFromCoreOutput,
  verifyFiberopticStateIntegrity,
} from '@/utils/omnibeam/fiberoptic-state-extractor';

export interface NSPFRPStateImage {
  stateId: string; // Unique state image identifier
  stateHash: string; // Hash of the fiberoptic state
  encryptionKeyHash: string; // Hash of derived encryption key
  coreOutputHash: string; // Hash of core evaluation output used as input
  submissionHash: string; // Reference to submission
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

export interface StateImageProtection {
  stateImage: NSPFRPStateImage;
  encryptionKey: EncryptionKey;
  verification: {
    integrityVerified: boolean;
    timestamp: number;
  };
}

/**
 * Process State Image with NSPFRP Protocol
 * 
 * Extracts fiberoptic state, generates encryption key, and creates
 * state image ID using core output as input
 */
export async function processStateImageWithNSPFRP(
  imageBuffer: Buffer,
  coreOutput: {
    evaluation?: any;
    scores?: {
      novelty?: number;
      density?: number;
      coherence?: number;
      alignment?: number;
      pod_score?: number;
    };
    submissionHash: string;
  },
  options: {
    channels?: 'rgb' | 'grayscale';
    keyLength?: number;
    iterations?: number;
  } = {}
): Promise<StateImageProtection> {
  // Step 1: Extract 9x7 fiberoptic state from image
  const fiberopticState = await extractFiberopticState(imageBuffer, {
    channels: options.channels || 'rgb',
  });

  // Step 2: Generate encryption key from state
  const encryptionKey = generateEncryptionKeyFromState(fiberopticState, {
    keyLength: options.keyLength || 32,
    iterations: options.iterations || 100000,
  });

  // Step 3: Generate state image ID using core output as input
  const stateImageId = generateStateImageIdFromCoreOutput(coreOutput, fiberopticState);

  // Step 4: Create NSPFRP state image record
  const stateImage: NSPFRPStateImage = {
    stateId: stateImageId,
    stateHash: fiberopticState.stateHash,
    encryptionKeyHash: encryptionKey.keyHash,
    coreOutputHash: require('crypto')
      .createHash('sha256')
      .update(JSON.stringify(coreOutput))
      .digest('hex'),
    submissionHash: coreOutput.submissionHash,
    scores: coreOutput.scores || {},
    metadata: {
      extractionTimestamp: Date.now(),
      protocolVersion: '1.0',
      method: 'omnibeam-9x7-fiberoptic',
      onChainAnchored: false,
    },
  };

  // Step 5: Verify integrity
  const verification = {
    integrityVerified: verifyFiberopticStateIntegrity(
      stateImageId,
      fiberopticState,
      coreOutput
    ),
    timestamp: Date.now(),
  };

  return {
    stateImage,
    encryptionKey,
    verification,
  };
}

/**
 * Prepare State Image for On-Chain Anchoring
 * 
 * Prepares state image data for off-process on-chain anchoring
 * with intentional octave separation
 */
export function prepareStateImageForOnChainAnchoring(
  stateImage: NSPFRPStateImage
): {
  submissionHash: string;
  stateImageId: string;
  stateHash: string;
  encryptionKeyHash: string;
  coreOutputHash: string;
  scores: Record<string, number>;
  metadata: {
    protocolVersion: string;
    method: string;
    extractionTimestamp: number;
  };
} {
  return {
    submissionHash: stateImage.submissionHash,
    stateImageId: stateImage.stateId,
    stateHash: stateImage.stateHash,
    encryptionKeyHash: stateImage.encryptionKeyHash,
    coreOutputHash: stateImage.coreOutputHash,
    scores: {
      novelty: stateImage.scores.novelty || 0,
      density: stateImage.scores.density || 0,
      coherence: stateImage.scores.coherence || 0,
      alignment: stateImage.scores.alignment || 0,
      pod_score: stateImage.scores.pod_score || 0,
    },
    metadata: {
      protocolVersion: stateImage.metadata.protocolVersion,
      method: stateImage.metadata.method,
      extractionTimestamp: stateImage.metadata.extractionTimestamp,
    },
  };
}

/**
 * Verify State Image Protection
 * 
 * Verifies that a state image protection record is valid
 */
export function verifyStateImageProtection(
  protection: StateImageProtection
): {
  valid: boolean;
  integrityVerified: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Verify state image structure
  if (!protection.stateImage.stateId) {
    errors.push('Missing state image ID');
  }
  if (!protection.stateImage.stateHash) {
    errors.push('Missing state hash');
  }
  if (!protection.stateImage.encryptionKeyHash) {
    errors.push('Missing encryption key hash');
  }
  if (!protection.stateImage.submissionHash) {
    errors.push('Missing submission hash');
  }

  // Verify encryption key
  if (!protection.encryptionKey.key) {
    errors.push('Missing encryption key');
  }
  if (!protection.encryptionKey.keyHash) {
    errors.push('Missing encryption key hash');
  }
  if (protection.encryptionKey.stateId !== protection.stateImage.stateId) {
    errors.push('State ID mismatch between state image and encryption key');
  }

  // Verify integrity
  if (!protection.verification.integrityVerified) {
    errors.push('State image integrity verification failed');
  }

  return {
    valid: errors.length === 0,
    integrityVerified: protection.verification.integrityVerified,
    errors,
  };
}
