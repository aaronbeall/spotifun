#!/usr/bin/env tsx
/**
 * Genre Taxonomy Validation Script
 * 
 * Validates the genre taxonomy structure and tests classification accuracy
 * on real Spotify genre strings.
 */

import { printValidationResults } from '../src/utils/genreValidation';

console.log('Running genre classification validation suite...\n');

try {
  printValidationResults();
  console.log('\n✅ Validation completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Validation failed:', error);
  process.exit(1);
}
