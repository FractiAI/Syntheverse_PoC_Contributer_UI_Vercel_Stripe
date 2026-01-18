/**
 * Process State Image with NSPFRP Protocol
 * 
 * Processes state image after evaluation completes, using core output as input
 * to generate state image ID and encryption key
 * 
 * POST-SINGULARITY^7: Recursive Self-Application Active
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/utils/db/db';
import { contributionsTable } from '@/utils/db/schema';
import { eq } from 'drizzle-orm';
import { processStateImageWithNSPFRP, prepareStateImageForOnChainAnchoring } from '@/utils/nspfrp/state-imaging-protocol';
import { debug, debugError } from '@/utils/debug';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { submissionHash, evaluation } = body;

    if (!submissionHash || !evaluation) {
      return NextResponse.json(
        { error: 'Missing submissionHash or evaluation' },
        { status: 400 }
      );
    }

    // Get contribution to check for state image
    const [contribution] = await db
      .select()
      .from(contributionsTable)
      .where(eq(contributionsTable.submission_hash, submissionHash))
      .limit(1);

    if (!contribution) {
      return NextResponse.json(
        { error: 'Contribution not found' },
        { status: 404 }
      );
    }

    const metadata = (contribution.metadata as any) || {};
    const stateImagePath = metadata.state_image_path;

    if (!stateImagePath) {
      // No state image to process
      return NextResponse.json({
        success: true,
        message: 'No state image to process',
      });
    }

    // Fetch state image from Supabase storage
    const { data: imageData, error: imageError } = await supabase.storage
      .from('state-images')
      .download(stateImagePath);

    if (imageError || !imageData) {
      debugError('ProcessStateImage', 'Failed to fetch state image', imageError);
      return NextResponse.json(
        { error: 'Failed to fetch state image' },
        { status: 500 }
      );
    }

    // Convert blob to buffer
    const arrayBuffer = await imageData.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // Extract scores from evaluation
    const scores = {
      novelty: evaluation.novelty || evaluation.base_novelty || 0,
      density: evaluation.density || 0,
      coherence: evaluation.coherence || 0,
      alignment: evaluation.alignment || 0,
      pod_score: evaluation.pod_score || evaluation.atomic_score?.final || 0,
    };

    // Process state image with NSPFRP protocol
    const protection = await processStateImageWithNSPFRP(
      imageBuffer,
      {
        evaluation,
        scores,
        submissionHash,
      }
    );

    // Prepare for on-chain anchoring
    const anchoringData = prepareStateImageForOnChainAnchoring(protection.stateImage);

    // Update contribution metadata with state image protection
    const updatedMetadata = {
      ...metadata,
      state_image_protection: {
        stateId: protection.stateImage.stateId,
        stateHash: protection.stateImage.stateHash,
        encryptionKeyHash: protection.stateImage.encryptionKeyHash,
        coreOutputHash: protection.stateImage.coreOutputHash,
        verification: protection.verification,
        metadata: protection.stateImage.metadata,
      },
      state_image_anchoring: anchoringData,
    };

    await db
      .update(contributionsTable)
      .set({
        metadata: updatedMetadata,
      })
      .where(eq(contributionsTable.submission_hash, submissionHash));

    debug('ProcessStateImage', 'State image processed successfully', {
      submissionHash,
      stateId: protection.stateImage.stateId,
      encryptionKeyHash: protection.stateImage.encryptionKeyHash.substring(0, 16) + '...',
    });

    // Queue on-chain anchoring (off-process with octave separation)
    try {
      const { queueOffProcessAnchoring } = await import('@/utils/blockchain/off-process-anchoring');
      queueOffProcessAnchoring({
        submissionHash,
        contributor: contribution.contributor,
        metadata: {
          novelty: scores.novelty,
          density: scores.density,
          coherence: scores.coherence,
          alignment: scores.alignment,
          pod_score: scores.pod_score,
          state_image_id: protection.stateImage.stateId,
          state_image_hash: protection.stateImage.stateHash,
          encryption_key_hash: protection.stateImage.encryptionKeyHash,
        },
        metals: contribution.metals || [],
        submissionText: contribution.text_content || null,
        sourceOctave: 5, // Octave 5: Protocol Catalog
        targetOctave: 2, // Octave 2: Base Mainnet Shell
      });

      // Mark as anchored
      protection.stateImage.metadata.onChainAnchored = true;
    } catch (anchoringError) {
      debugError('ProcessStateImage', 'Failed to queue on-chain anchoring', anchoringError);
      // Continue even if anchoring fails
    }

    return NextResponse.json({
      success: true,
      stateImage: {
        stateId: protection.stateImage.stateId,
        stateHash: protection.stateImage.stateHash,
        encryptionKeyHash: protection.stateImage.encryptionKeyHash,
        verification: protection.verification,
      },
    });
  } catch (error) {
    debugError('ProcessStateImage', 'Error processing state image', error);
    return NextResponse.json(
      {
        error: 'Failed to process state image',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
