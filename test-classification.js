#!/usr/bin/env node
/**
 * Simple test script to verify genre classification improvements
 */

const { printValidationResults } = require('./src/utils/genreValidation');
const { classifyGenre, calculateGenreVACRSScore } = require('./src/utils/improvedClassification');

console.log('=== Genre Classification Test Suite ===\n');

// Run validation
printValidationResults();

// Test some specific classifications
console.log('\n=== Specific Classification Tests ===\n');

const testCases = [
  'pop',
  'uk drill',
  'atmospheric black metal',
  'indie dream pop',
  'lo-fi hip hop',
  'some-unknown-genre',
];

for (const genre of testCases) {
  const result = classifyGenre(genre);
  console.log(`Genre: "${genre}"`);
  console.log(`  Coverage: ${(result.coverage * 100).toFixed(1)}%`);
  console.log(`  Valence: ${result.scores.valence.toFixed(2)}`);
  console.log(`  Arousal: ${result.scores.arousal.toFixed(2)}`);
  console.log(`  Matched genres: ${result.classifications.filter(c => c.matchedGenre).map(c => c.matchedGenre).join(', ') || 'none'}`);
  console.log('');
}

console.log('=== Tests Complete ===\n');
