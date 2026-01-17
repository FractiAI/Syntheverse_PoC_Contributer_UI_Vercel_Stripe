import crypto from 'crypto';
import { 
  ScoringInput, 
  AtomicScore, 
  ScoringExecutionContext,
  BridgeSpec,
  BridgeSpecValidationResult,
  BMPPrecisionResult
} from '@/types/scoring';
import { validateBridgeSpec } from '@/utils/bridgespec/BridgeSpecValidator';
import { calculateBMPPrecisionWithBridgeSpec } from '@/utils/gates/PrecisionCoupling';

export class AtomicScorer {
  private static instance: AtomicScorer;
  private executionCount: number = 0;

  private constructor() {}

  public static getInstance(): AtomicScorer {
    if (!AtomicScorer.instance) {
      AtomicScorer.instance = new AtomicScorer();
    }
    return AtomicScorer.instance;
  }

  /**
   * ATOMIC SCORE COMPUTATION: INSTRUMENT GRADE RAW
   * 
   * Returns ONLY the raw HHF-AI MRI sum of novelty, density, coherence, and alignment.
   * NO bonuses, NO penalties, NO multipliers.
   */
  public computeScore(params: ScoringInput): AtomicScore {
    this.executionCount++;

    // Generate execution context
    const executionContext = this.generateExecutionContext(params.toggles, params.seed);

    // RAW SUMMATION (The "No Nothing" logic)
    const composite = params.novelty + params.density + params.coherence + params.alignment;
    const rawFinal = composite;

    // TRINARY NEUTRALIZATION GATE (Range protection only)
    const finalScore = this.neutralizationGate(rawFinal, false);

    // BridgeSpec & TO Integration (NSPFRP-prophylactic)
    // Extract and validate BridgeSpec if provided
    const bridgeSpec = params.bridgeSpec || null;
    const bridgeSpecValidation = bridgeSpec ? validateBridgeSpec(bridgeSpec) : null;
    
    // Calculate n̂ (BMP precision) with BridgeSpec coupling
    const precisionResult = calculateBMPPrecisionWithBridgeSpec(
      params.coherence,
      bridgeSpecValidation
    );
    
    // Calculate BridgeSpec hash (SHA-256) if BridgeSpec exists
    let bridgespecHash: string | undefined;
    if (bridgeSpec) {
      const bridgeSpecJson = JSON.stringify(bridgeSpec, Object.keys(bridgeSpec).sort());
      bridgespecHash = crypto.createHash('sha256').update(bridgeSpecJson).digest('hex');
    }

    // Build trace for auditability (with full precision for Marek/Simba audit + BridgeSpec/TO)
    const trace = {
      composite,
      penalty_percent: 0,
      penalty_percent_exact: 0,
      bonus_multiplier: 1.0,
      bonus_multiplier_exact: 1.0,
      seed_multiplier: 1.0,
      edge_multiplier: 1.0,
      formula: `(${params.novelty} + ${params.density} + ${params.coherence} + ${params.alignment}) = ${finalScore}`,
      intermediate_steps: {
        after_penalty: composite,
        after_penalty_exact: composite,
        after_bonus: composite,
        after_bonus_exact: composite,
        after_seed: composite,
        raw_final: rawFinal,
        clamped_final: finalScore,
      },
      // NEW: Precision/BMP fields (n̂, bubble_class, epsilon, tier)
      precision: {
        n_hat: precisionResult.n_hat,
        bubble_class: precisionResult.bubble_class,
        epsilon: precisionResult.epsilon,
        coherence: precisionResult.coherence,
        c: precisionResult.c,
        penalty_inconsistency: precisionResult.penalty_inconsistency,
        tier: precisionResult.tier,
      },
      // NEW: Extended THALET with T-B (Testability/Bicameral) checks
      thalet: bridgeSpecValidation
        ? {
            T_B: {
              T_B_01: bridgeSpecValidation.T_B_01,
              T_B_02: bridgeSpecValidation.T_B_02,
              T_B_03: bridgeSpecValidation.T_B_03,
              T_B_04: bridgeSpecValidation.T_B_04,
              overall: bridgeSpecValidation.overall,
              testabilityScore: bridgeSpecValidation.testabilityScore,
              degeneracyPenalty: bridgeSpecValidation.degeneracyPenalty,
            },
          }
        : undefined,
      // NEW: BridgeSpec hash pointer
      bridgespec_hash: bridgespecHash,
    };

    // Build atomic payload (without hash)
    const payloadWithoutHash: Omit<AtomicScore, 'integrity_hash'> = {
      final: finalScore,
      execution_context: executionContext,
      trace,
    };

    // Generate integrity hash
    const integrityHash = this.generateIntegrityHash(payloadWithoutHash);

    return {
      ...payloadWithoutHash,
      integrity_hash: integrityHash,
    } as AtomicScore;
  }

  private neutralizationGate(score: number, isQualified: boolean): number {
    // Range protection: [0, 10000]
    return Math.max(0, Math.min(10000, score));
  }

  private generateExecutionContext(toggles?: any, seed?: number | null): ScoringExecutionContext {
    return {
      timestamp_utc: new Date().toISOString(),
      pipeline_version: '2.0.13',
      execution_id: crypto.randomUUID(),
      config_id: 'default-v2',
      sandbox_id: null,
      toggles: toggles || { seed_enabled: false, edge_enabled: false },
      seed: seed || null,
    };
  }

  private generateIntegrityHash(payload: any): string {
    const canonical = JSON.stringify(payload, Object.keys(payload).sort());
    return crypto.createHash('sha256').update(canonical).digest('hex');
  }
}
