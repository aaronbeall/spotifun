/**
 * Genre Taxonomy Validation Script
 * 
 * Validates the genre taxonomy structure and tests classification accuracy
 * on real Spotify genre strings.
 */

import { GENRE_TAXONOMY } from './genreTaxonomy';
import { classifyGenre, classifySingleGenre } from './improvedClassification';
import { normalizeGenre } from './genreNormalization';

/**
 * Validation errors
 */
export interface ValidationError {
  type: 'missing_scores' | 'missing_parent' | 'cycle_detected' | 'orphan_genre';
  genreKey: string;
  message: string;
}

/**
 * Validate the genre taxonomy structure
 * 
 * Checks:
 * 1. Every top-level genre has complete VACRS scores
 * 2. Every parent reference exists
 * 3. No circular parent chains
 * 4. All genres can resolve to scores
 * 
 * @returns Array of validation errors (empty if valid)
 */
export function validateTaxonomy(): ValidationError[] {
  const errors: ValidationError[] = [];
  const visited = new Set<string>();
  
  // Helper to check for cycles
  function hasCycle(genreKey: string, chain: Set<string> = new Set()): boolean {
    if (chain.has(genreKey)) {
      return true; // Cycle detected
    }
    
    const entry = GENRE_TAXONOMY[genreKey];
    if (!entry) {
      return false; // Parent doesn't exist (will be caught separately)
    }
    
    if (!entry.parent) {
      return false; // Top-level, no cycle
    }
    
    chain.add(genreKey);
    return hasCycle(entry.parent, chain);
  }
  
  // Helper to resolve scores (following parent chain)
  function resolveScores(genreKey: string, chain: Set<string> = new Set()): boolean {
    if (chain.has(genreKey)) {
      return false; // Cycle
    }
    
    const entry = GENRE_TAXONOMY[genreKey];
    if (!entry) {
      return false; // Doesn't exist
    }
    
    if (entry.scores) {
      return true; // Has scores
    }
    
    if (!entry.parent) {
      return false; // Top-level but no scores
    }
    
    chain.add(genreKey);
    return resolveScores(entry.parent, chain);
  }
  
  // Validate each genre
  for (const [genreKey, entry] of Object.entries(GENRE_TAXONOMY)) {
    // Check if top-level genre has scores
    if (!entry.parent && !entry.scores) {
      errors.push({
        type: 'missing_scores',
        genreKey,
        message: `Top-level genre "${genreKey}" must have complete VACRS scores`
      });
    }
    
    // Check if parent exists
    if (entry.parent && !GENRE_TAXONOMY[entry.parent]) {
      errors.push({
        type: 'missing_parent',
        genreKey,
        message: `Genre "${genreKey}" references non-existent parent "${entry.parent}"`
      });
    }
    
    // Check for cycles
    if (hasCycle(genreKey)) {
      errors.push({
        type: 'cycle_detected',
        genreKey,
        message: `Genre "${genreKey}" has a circular parent chain`
      });
    }
    
    // Check if genre can resolve to scores
    if (!resolveScores(genreKey)) {
      errors.push({
        type: 'orphan_genre',
        genreKey,
        message: `Genre "${genreKey}" cannot resolve to VACRS scores (no scores and parent chain doesn't lead to scores)`
      });
    }
  }
  
  return errors;
}

/**
 * Test cases - real Spotify genre strings
 */
export const TEST_GENRES = [
  // Should classify well
  'pop',
  'rock',
  'hip hop',
  'hip-hop',
  'electronic',
  'jazz',
  'classical',
  'metal',
  'punk',
  'indie',
  'indie rock',
  'indie pop',
  'alternative rock',
  'dream pop',
  'shoegaze',
  'post-punk',
  'post-rock',
  'techno',
  'house',
  'deep house',
  'tech house',
  'progressive house',
  'drum and bass',
  'drum & bass',
  'dnb',
  'dubstep',
  'trap',
  'drill',
  'uk drill',
  'cloud rap',
  'emo rap',
  'death metal',
  'black metal',
  'doom metal',
  'metalcore',
  'thrash metal',
  'progressive metal',
  'power metal',
  'grunge',
  'garage rock',
  'psychedelic',
  'synthpop',
  'synth-pop',
  'electropop',
  'k-pop',
  'j-pop',
  'r&b',
  'r and b',
  'neo soul',
  'neo-soul',
  'funk',
  'soul',
  'reggae',
  'dub',
  'dancehall',
  'reggaeton',
  'bossa nova',
  'lo-fi',
  'lofi',
  'chillhop',
  'ambient',
  'drone',
  'dark ambient',
  'vaporwave',
  'synthwave',
  'folk',
  'indie folk',
  'singer-songwriter',
  'country',
  'bluegrass',
  'blues',
  'experimental',
  'noise',
  'industrial',
  'goth',
  'emo',
  'hardcore',
  'pop punk',
  'bedroom pop',
  
  // Complex/compound genres
  'alternative indie rock',
  'indie dream pop',
  'progressive death metal',
  'atmospheric black metal',
  'post-hardcore',
  'math rock',
  
  // Edge cases that might not match
  'wonky',
  'glitch hop',
  'future funk',
  'witch house',
  'seapunk',
  'vaporwave',
  'hyperpop',
];

/**
 * Test classification on sample genres
 * 
 * @returns Test results with coverage statistics
 */
export function testClassification(): {
  total: number;
  classified: number;
  unknown: number;
  coverage: number;
  samples: Array<{
    input: string;
    normalized: string;
    matchedGenre: string | null;
    matchType: string;
    hasScores: boolean;
  }>;
} {
  const samples = TEST_GENRES.map(genre => {
    const result = classifySingleGenre(genre);
    return {
      input: genre,
      normalized: normalizeGenre(genre),
      matchedGenre: result.matchedGenre,
      matchType: result.matchType,
      hasScores: result.scores !== null
    };
  });
  
  const classified = samples.filter(s => s.hasScores).length;
  const unknown = samples.filter(s => !s.hasScores).length;
  const coverage = classified / samples.length;
  
  return {
    total: samples.length,
    classified,
    unknown,
    coverage,
    samples
  };
}

/**
 * Run all validation checks and tests
 */
export function runValidation(): {
  taxonomyValid: boolean;
  taxonomyErrors: ValidationError[];
  classificationResults: ReturnType<typeof testClassification>;
} {
  const taxonomyErrors = validateTaxonomy();
  const classificationResults = testClassification();
  
  return {
    taxonomyValid: taxonomyErrors.length === 0,
    taxonomyErrors,
    classificationResults
  };
}

/**
 * Print validation results to console
 */
export function printValidationResults(): void {
  console.log('\n=== GENRE TAXONOMY VALIDATION ===\n');
  
  const results = runValidation();
  
  // Taxonomy validation
  console.log('1. Taxonomy Structure Validation');
  if (results.taxonomyValid) {
    console.log('   ✓ Taxonomy is valid');
  } else {
    console.log(`   ✗ Found ${results.taxonomyErrors.length} errors:`);
    for (const error of results.taxonomyErrors) {
      console.log(`     - [${error.type}] ${error.message}`);
    }
  }
  
  // Classification tests
  console.log('\n2. Classification Tests');
  console.log(`   Total test cases: ${results.classificationResults.total}`);
  console.log(`   Classified: ${results.classificationResults.classified} (${(results.classificationResults.coverage * 100).toFixed(1)}%)`);
  console.log(`   Unknown: ${results.classificationResults.unknown} (${((1 - results.classificationResults.coverage) * 100).toFixed(1)}%)`);
  
  // Show unknowns
  const unknowns = results.classificationResults.samples.filter(s => !s.hasScores);
  if (unknowns.length > 0) {
    console.log('\n   Unknown genres:');
    for (const sample of unknowns) {
      console.log(`     - "${sample.input}" (normalized: "${sample.normalized}")`);
    }
  }
  
  // Show some successful matches
  console.log('\n   Sample successful classifications:');
  const successful = results.classificationResults.samples
    .filter(s => s.hasScores)
    .slice(0, 10);
  for (const sample of successful) {
    console.log(`     - "${sample.input}" → ${sample.matchedGenre} (${sample.matchType})`);
  }
  
  console.log('\n=== VALIDATION COMPLETE ===\n');
}

// Run validation if executed directly
if (require.main === module) {
  printValidationResults();
}
