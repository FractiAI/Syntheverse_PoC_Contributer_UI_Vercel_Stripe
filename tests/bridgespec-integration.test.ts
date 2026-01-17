/**
 * BridgeSpec Integration Tests
 * 
 * Tests for BridgeSpec extraction, validation, precision calculation,
 * and integration into AtomicScorer
 * 
 * NSPFRP: Single source of truth testing for BridgeSpec utilities
 */

import { describe, it } from 'mocha';
import { expect } from 'chai';
import { extractBridgeSpec } from '@/utils/bridgespec/BridgeSpecExtractor';
import { validateBridgeSpec } from '@/utils/bridgespec/BridgeSpecValidator';
import { calculateBMPPrecisionWithBridgeSpec } from '@/utils/gates/PrecisionCoupling';
import { AtomicScorer } from '@/utils/scoring/AtomicScorer';
import { BridgeSpec } from '@/types/bridgespec';

describe('BridgeSpec Integration', () => {
  const validBridgeSpec: BridgeSpec = {
    bridges: [
      {
        claim_id: 'claim-1',
        regime: 'EM/Maxwell',
        observables: ['electric_field', 'magnetic_field'],
        differential_prediction: 'The electric field will increase by 15% when the magnetic field is applied at 45 degrees',
        failure_condition: 'If the electric field does not increase by at least 10%, the claim is falsified',
        floor_constraints: ['vacuum conditions', 'temperature < 273K'],
      },
    ],
  };

  const invalidBridgeSpec: BridgeSpec = {
    bridges: [
      {
        claim_id: 'claim-1',
        regime: '', // Missing regime
        observables: [], // Missing observables
        differential_prediction: 'may vary', // Tautological
        failure_condition: '', // Missing failure condition
        floor_constraints: [],
      },
    ],
  };

  describe('BridgeSpec Extraction', () => {
    it('should extract valid BridgeSpec from data object', () => {
      const data = { bridge_spec: validBridgeSpec };
      const extracted = extractBridgeSpec(data);
      expect(extracted).to.deep.equal(validBridgeSpec);
    });

    it('should extract BridgeSpec from metadata', () => {
      const data = { metadata: { bridge_spec: validBridgeSpec } };
      const extracted = extractBridgeSpec(data);
      expect(extracted).to.deep.equal(validBridgeSpec);
    });

    it('should return null if BridgeSpec is missing', () => {
      const data = {};
      const extracted = extractBridgeSpec(data);
      expect(extracted).to.be.null;
    });

    it('should return null if BridgeSpec has invalid structure', () => {
      const data = { bridge_spec: { invalid: 'structure' } };
      const extracted = extractBridgeSpec(data);
      expect(extracted).to.be.null;
    });
  });

  describe('BridgeSpec Validation', () => {
    it('should validate valid BridgeSpec', () => {
      const result = validateBridgeSpec(validBridgeSpec);
      expect(result.valid).to.be.true;
      expect(result.T_B_01).to.equal('passed');
      expect(result.T_B_02).to.equal('passed');
      expect(result.T_B_03).to.equal('passed');
      expect(result.overall).to.equal('passed');
      expect(result.testabilityScore).to.be.greaterThan(0.8);
      expect(result.degeneracyPenalty).to.be.lessThan(0.5);
    });

    it('should reject invalid BridgeSpec', () => {
      const result = validateBridgeSpec(invalidBridgeSpec);
      expect(result.valid).to.be.false;
      expect(result.T_B_01).to.equal('failed');
      expect(result.T_B_02).to.equal('failed');
      expect(result.T_B_03).to.equal('failed');
      expect(result.overall).to.equal('failed');
      expect(result.testabilityScore).to.be.lessThan(0.5);
    });

    it('should handle missing BridgeSpec', () => {
      const result = validateBridgeSpec(null);
      expect(result.valid).to.be.false;
      expect(result.overall).to.equal('failed');
      expect(result.degeneracyPenalty).to.equal(1.0);
    });

    it('should detect degeneracy (T-B-04)', () => {
      const degeneracySpec: BridgeSpec = {
        bridges: [
          {
            claim_id: 'claim-1',
            regime: 'EM/Maxwell',
            observables: ['field'],
            differential_prediction: 'Some things may vary in various ways',
            failure_condition: 'Cannot be falsified unless something changes',
            floor_constraints: [], // Missing floor constraints
          },
        ],
      };
      const result = validateBridgeSpec(degeneracySpec);
      expect(result.T_B_04).to.equal('soft_failed');
      expect(result.degeneracyPenalty).to.be.greaterThan(0.3);
    });
  });

  describe('BMP Precision Calculation', () => {
    it('should calculate n̂ with valid BridgeSpec', () => {
      const validation = validateBridgeSpec(validBridgeSpec);
      const result = calculateBMPPrecisionWithBridgeSpec(5000, validation);
      
      expect(result.n_hat).to.be.a('number');
      expect(result.n_hat).to.be.greaterThanOrEqual(0);
      expect(result.n_hat).to.be.lessThanOrEqual(16);
      expect(result.bubble_class).to.match(/^B\d+\.\d+$/);
      expect(result.tier).to.be.oneOf(['Copper', 'Silver', 'Gold', 'Community']);
      expect(result.epsilon).to.be.greaterThan(0);
      expect(result.c).to.equal(5000 / 2500);
      expect(result.penalty_inconsistency).to.be.lessThan(0.5);
    });

    it('should penalize missing BridgeSpec', () => {
      const validation = validateBridgeSpec(null);
      const result = calculateBMPPrecisionWithBridgeSpec(5000, validation);
      
      expect(result.penalty_inconsistency).to.equal(1.0);
      expect(result.n_hat).to.be.lessThan(3); // Should be Community tier
      expect(result.tier).to.equal('Community');
    });

    it('should penalize invalid BridgeSpec', () => {
      const validation = validateBridgeSpec(invalidBridgeSpec);
      const result = calculateBMPPrecisionWithBridgeSpec(5000, validation);
      
      expect(result.penalty_inconsistency).to.be.greaterThan(0.5);
      expect(result.n_hat).to.be.lessThan(result.n_hat);
    });

    it('should increase n̂ with higher coherence', () => {
      const validation = validateBridgeSpec(validBridgeSpec);
      const lowCoherence = calculateBMPPrecisionWithBridgeSpec(1000, validation);
      const highCoherence = calculateBMPPrecisionWithBridgeSpec(9000, validation);
      
      expect(highCoherence.n_hat).to.be.greaterThan(lowCoherence.n_hat);
    });
  });

  describe('AtomicScorer Integration', () => {
    it('should include precision in trace when BridgeSpec provided', () => {
      const score = AtomicScorer.computeScore({
        novelty: 2500,
        density: 2500,
        coherence: 2500,
        alignment: 2500,
        redundancy_overlap_percent: 10,
        is_seed_from_ai: false,
        is_edge_from_ai: false,
        toggles: {
          overlap_on: true,
          seed_on: false,
          edge_on: false,
          metal_policy_on: true,
        },
        bridgeSpec: validBridgeSpec,
      });

      expect(score.trace.precision).to.exist;
      expect(score.trace.precision?.n_hat).to.be.a('number');
      expect(score.trace.precision?.bubble_class).to.match(/^B\d+\.\d+$/);
      expect(score.trace.precision?.tier).to.be.oneOf(['Copper', 'Silver', 'Gold', 'Community']);
      expect(score.trace.precision?.coherence).to.equal(2500);
    });

    it('should include T_B in trace when BridgeSpec provided', () => {
      const score = AtomicScorer.computeScore({
        novelty: 2500,
        density: 2500,
        coherence: 2500,
        alignment: 2500,
        redundancy_overlap_percent: 10,
        is_seed_from_ai: false,
        is_edge_from_ai: false,
        toggles: {
          overlap_on: true,
          seed_on: false,
          edge_on: false,
          metal_policy_on: true,
        },
        bridgeSpec: validBridgeSpec,
      });

      expect(score.trace.thalet).to.exist;
      expect(score.trace.thalet?.T_B).to.exist;
      expect(score.trace.thalet?.T_B?.T_B_01).to.equal('passed');
      expect(score.trace.thalet?.T_B?.T_B_02).to.equal('passed');
      expect(score.trace.thalet?.T_B?.T_B_03).to.equal('passed');
      expect(score.trace.thalet?.T_B?.overall).to.equal('passed');
    });

    it('should include bridgespec_hash in trace when BridgeSpec provided', () => {
      const score = AtomicScorer.computeScore({
        novelty: 2500,
        density: 2500,
        coherence: 2500,
        alignment: 2500,
        redundancy_overlap_percent: 10,
        is_seed_from_ai: false,
        is_edge_from_ai: false,
        toggles: {
          overlap_on: true,
          seed_on: false,
          edge_on: false,
          metal_policy_on: true,
        },
        bridgeSpec: validBridgeSpec,
      });

      expect(score.trace.bridgespec_hash).to.exist;
      expect(score.trace.bridgespec_hash).to.match(/^[a-f0-9]{64}$/); // SHA-256 hash
    });

    it('should not include precision/T_B when BridgeSpec not provided', () => {
      const score = AtomicScorer.computeScore({
        novelty: 2500,
        density: 2500,
        coherence: 2500,
        alignment: 2500,
        redundancy_overlap_percent: 10,
        is_seed_from_ai: false,
        is_edge_from_ai: false,
        toggles: {
          overlap_on: true,
          seed_on: false,
          edge_on: false,
          metal_policy_on: true,
        },
        // No bridgeSpec provided
      });

      // Precision should still exist (calculated with missing BridgeSpec penalty)
      expect(score.trace.precision).to.exist;
      expect(score.trace.precision?.tier).to.equal('Community');
      expect(score.trace.precision?.penalty_inconsistency).to.equal(1.0);
      
      // T_B should not exist when BridgeSpec is missing
      expect(score.trace.thalet).to.be.undefined;
      expect(score.trace.bridgespec_hash).to.be.undefined;
    });

    it('should maintain integrity hash with BridgeSpec', () => {
      const score1 = AtomicScorer.computeScore({
        novelty: 2500,
        density: 2500,
        coherence: 2500,
        alignment: 2500,
        redundancy_overlap_percent: 10,
        is_seed_from_ai: false,
        is_edge_from_ai: false,
        toggles: {
          overlap_on: true,
          seed_on: false,
          edge_on: false,
          metal_policy_on: true,
        },
        bridgeSpec: validBridgeSpec,
      });

      const score2 = AtomicScorer.computeScore({
        novelty: 2500,
        density: 2500,
        coherence: 2500,
        alignment: 2500,
        redundancy_overlap_percent: 10,
        is_seed_from_ai: false,
        is_edge_from_ai: false,
        toggles: {
          overlap_on: true,
          seed_on: false,
          edge_on: false,
          metal_policy_on: true,
        },
        bridgeSpec: validBridgeSpec,
      });

      // Same inputs should produce same hash (deterministic)
      expect(score1.integrity_hash).to.equal(score2.integrity_hash);
    });

    it('should affect precision calculation based on BridgeSpec quality', () => {
      const validScore = AtomicScorer.computeScore({
        novelty: 2500,
        density: 2500,
        coherence: 5000,
        alignment: 2500,
        redundancy_overlap_percent: 10,
        is_seed_from_ai: false,
        is_edge_from_ai: false,
        toggles: {
          overlap_on: true,
          seed_on: false,
          edge_on: false,
          metal_policy_on: true,
        },
        bridgeSpec: validBridgeSpec,
      });

      const invalidScore = AtomicScorer.computeScore({
        novelty: 2500,
        density: 2500,
        coherence: 5000,
        alignment: 2500,
        redundancy_overlap_percent: 10,
        is_seed_from_ai: false,
        is_edge_from_ai: false,
        toggles: {
          overlap_on: true,
          seed_on: false,
          edge_on: false,
          metal_policy_on: true,
        },
        bridgeSpec: invalidBridgeSpec,
      });

      // Valid BridgeSpec should have higher n̂ than invalid
      expect(validScore.trace.precision?.n_hat).to.be.greaterThan(
        invalidScore.trace.precision?.n_hat || 0
      );
    });
  });
});


