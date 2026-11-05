import { existsSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { MUSIC_PERSONAS } from './musicPersonas';
import { PERSONA_CHARACTERS, personaPortrait } from './personaCharacters';

describe('persona characters', () => {
  it('gives every persona a named character and a portrait file', () => {
    for (const persona of MUSIC_PERSONAS) {
      const character = PERSONA_CHARACTERS[persona.id];
      expect(character, persona.id).toBeDefined();
      expect(character.name.length).toBeGreaterThan(0);
      const file = path.join(process.cwd(), 'public', personaPortrait(persona.id));
      expect(existsSync(file), file).toBe(true);
    }
  });

  it('uses each character name only once', () => {
    const names = Object.values(PERSONA_CHARACTERS).map(c => c.name);
    expect(new Set(names).size).toBe(names.length);
    expect(names.length).toBe(MUSIC_PERSONAS.length);
  });
});
