#!/usr/bin/env node
/**
 * Run genre taxonomy validation
 */

import { printValidationResults } from './src/utils/genreValidation.js';

console.log('Running genre classification validation suite...\n');

try {
  printValidationResults();
  console.log('\n✅ Validation completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Validation failed:', error);
  process.exit(1);
}
