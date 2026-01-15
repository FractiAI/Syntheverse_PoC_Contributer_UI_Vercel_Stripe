/**
 * Narrative Sanitizer - Option A Implementation
 * 
 * Per AAC-1 Directive: Strip all numeric claims (penalty %, totals, finals) 
 * and remove embedded JSON from LLM narratives.
 * 
 * The Atomic Trace (Ta) is the only sovereign source of truth.
 * If the LLM cannot mirror the atomic trace with 100% fidelity,
 * it shall remain text-only.
 */

/**
 * Sanitizes LLM narrative text by removing all authoritative numeric claims
 * and embedded JSON blocks.
 * 
 * @param rawNarrative - The raw LLM narrative text
 * @returns Sanitized text-only narrative with numeric claims and JSON removed
 */
export function sanitizeNarrative(rawNarrative: string): string {
  if (!rawNarrative || rawNarrative.trim().length === 0) {
    return rawNarrative;
  }

  let sanitized = rawNarrative;

  // 1. Remove all JSON code blocks (```json ... ``` or ``` ... ```)
  // Match code blocks that may contain JSON
  sanitized = sanitized.replace(/```json[\s\S]*?```/gi, '');
  sanitized = sanitized.replace(/```[\s\S]*?```/g, (match) => {
    // Only remove if it looks like JSON (contains {, }, or common JSON keys)
    if (match.match(/\{[^}]*"|"penalty|"final|"score|"total|"composite/i)) {
      return '';
    }
    return match; // Keep non-JSON code blocks
  });

  // 2. Remove penalty percentage claims
  // Patterns: "penalty 65.4%", "penalty of 65.4%", "65.4% penalty", "penalty: 65.4%", etc.
  sanitized = sanitized.replace(/\bpenalty\s*(?:of|:)?\s*\d+\.?\d*\s*%/gi, '[penalty percentage removed]');
  sanitized = sanitized.replace(/\b\d+\.?\d*\s*%\s*penalty\s*(?:applied|used)?/gi, '[penalty percentage removed]');
  sanitized = sanitized.replace(/\bpenalty\s*applied[:\s]*\d+\.?\d*\s*%/gi, '[penalty percentage removed]');
  sanitized = sanitized.replace(/\bpenalty[:\s]*\d+\.?\d*\s*%/gi, '[penalty percentage removed]');
  sanitized = sanitized.replace(/\b\d+\.?\d*\s*%\s*penalty/gi, '[penalty percentage removed]');

  // 3. Remove final score claims
  // Patterns: "final ~2442", "final score 2442", "final: 2442", "final PoC: 2442", etc.
  sanitized = sanitized.replace(/\bfinal\s*(?:score|PoC|poc)?\s*(?:of|:)?\s*~?\s*\d+(?:\.\d+)?/gi, '[final score removed]');
  sanitized = sanitized.replace(/\bfinal[:\s]*~?\s*\d+(?:\.\d+)?/gi, '[final score removed]');
  sanitized = sanitized.replace(/\bscore[:\s]*~?\s*\d+(?:\.\d+)?/gi, (match) => {
    // Only remove if it's clearly a final score claim, not other uses of "score"
    if (match.match(/score[:\s]*~?\s*\d{3,}/)) {
      return '[final score removed]';
    }
    return match;
  });

  // 4. Remove composite/total score claims
  sanitized = sanitized.replace(/\bcomposite\s*(?:score)?\s*(?:of|:)?\s*\d+(?:\.\d+)?/gi, '[composite score removed]');
  sanitized = sanitized.replace(/\btotal\s*(?:score)?\s*(?:of|:)?\s*\d+(?:\.\d+)?/gi, '[total score removed]');

  // 5. Remove bonus multiplier claims
  sanitized = sanitized.replace(/\bbonus\s*(?:multiplier)?\s*(?:of|:)?\s*\d+\.?\d*/gi, '[bonus multiplier removed]');
  sanitized = sanitized.replace(/\bmultiplier\s*(?:of|:)?\s*\d+\.?\d*/gi, '[multiplier removed]');

  // 6. Remove any remaining numeric patterns that look like scores (4+ digit numbers)
  // But be careful not to remove years, timestamps, or other legitimate numbers
  sanitized = sanitized.replace(/\b(?:PoC|poc|score|total|final)\s*[:\s]*~?\s*(\d{4,}(?:\.\d+)?)/gi, '[numeric score removed]');

  // 7. Clean up multiple consecutive removals
  sanitized = sanitized.replace(/\[.*?removed\]\s*\[.*?removed\]/g, '[numeric claims removed]');
  sanitized = sanitized.replace(/\[.*?removed\]\s*\[.*?removed\]/g, '[numeric claims removed]');

  // 8. Remove empty lines that might result from removals
  sanitized = sanitized.replace(/\n\s*\n\s*\n/g, '\n\n');

  return sanitized.trim();
}

