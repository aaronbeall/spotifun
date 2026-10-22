import { describe, it, expect } from 'vitest';
import { getDominantTrait } from './vacrs';

describe('getDominantTrait', () => {
  it('returns high-side trait when score >= 0.5', () => {
    const result = getDominantTrait('valence', 0.78);
    
    expect(result.label).toBe('Pleasant');
    expect(result.percent).toBe(78);
    expect(result.isHigh).toBe(true);
  });

  it('returns low-side trait when score < 0.5', () => {
    const result = getDominantTrait('valence', 0.22);
    
    expect(result.label).toBe('Unpleasant');
    expect(result.percent).toBe(78); // 100 - 22 = 78
    expect(result.isHigh).toBe(false);
  });

  it('handles exactly 0.5 as high side', () => {
    const result = getDominantTrait('arousal', 0.5);
    
    expect(result.label).toBe('Energetic');
    expect(result.percent).toBe(50);
    expect(result.isHigh).toBe(true);
  });

  it('works correctly for arousal dimension', () => {
    const calm = getDominantTrait('arousal', 0.3);
    expect(calm.label).toBe('Calm');
    expect(calm.percent).toBe(70);
    expect(calm.isHigh).toBe(false);
    
    const energetic = getDominantTrait('arousal', 0.9);
    expect(energetic.label).toBe('Energetic');
    expect(energetic.percent).toBe(90);
    expect(energetic.isHigh).toBe(true);
  });

  it('works correctly for complexity dimension', () => {
    const simple = getDominantTrait('complexity', 0.15);
    expect(simple.label).toBe('Simple');
    expect(simple.percent).toBe(85);
    expect(simple.isHigh).toBe(false);
    
    const complex = getDominantTrait('complexity', 0.95);
    expect(complex.label).toBe('Complex');
    expect(complex.percent).toBe(95);
    expect(complex.isHigh).toBe(true);
  });

  it('works correctly for rawness dimension', () => {
    const polished = getDominantTrait('rawness', 0.1);
    expect(polished.label).toBe('Polished');
    expect(polished.percent).toBe(90);
    expect(polished.isHigh).toBe(false);
    
    const raw = getDominantTrait('rawness', 0.85);
    expect(raw.label).toBe('Raw');
    expect(raw.percent).toBe(85);
    expect(raw.isHigh).toBe(true);
  });

  it('works correctly for socialPresence dimension', () => {
    const solitary = getDominantTrait('socialPresence', 0.25);
    expect(solitary.label).toBe('Solitary');
    expect(solitary.percent).toBe(75);
    expect(solitary.isHigh).toBe(false);
    
    const communal = getDominantTrait('socialPresence', 0.88);
    expect(communal.label).toBe('Communal');
    expect(communal.percent).toBe(88);
    expect(communal.isHigh).toBe(true);
  });

  it('handles extreme values correctly', () => {
    const min = getDominantTrait('valence', 0);
    expect(min.percent).toBe(100);
    expect(min.isHigh).toBe(false);
    
    const max = getDominantTrait('valence', 1);
    expect(max.percent).toBe(100);
    expect(max.isHigh).toBe(true);
  });

  it('rounds percentages correctly', () => {
    const result = getDominantTrait('complexity', 0.666);
    expect(result.percent).toBe(67); // Rounded from 66.6
    expect(result.isHigh).toBe(true);
  });
});
