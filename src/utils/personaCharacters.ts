// The character drawn for each listener persona. Portraits live in
// public/personas/<persona-id>.webp, one per entry in MUSIC_PERSONAS.

export interface PersonaCharacter {
  name: string;
  /** One line describing who the character is and what they are up to. */
  bio: string;
}

export const PERSONA_CHARACTERS: Record<string, PersonaCharacter> = {
  'the-trend-voyager': { name: 'Skye', bio: 'A sea otter surfing a smartphone over a wave of album covers, one favourite-band pin on the life vest.' },
  'the-chill-curator': { name: 'Basil', bio: 'A sloth sunk into a beanbag, flipping through a crate of records one slow claw at a time.' },
  'the-electric-escapist': { name: 'Volta', bio: 'A jellyfish dancing with its eyes shut, tentacles made of glowing aux cables, one sparkly tear.' },
  'the-reflective-dreamer': { name: 'Nimbus', bio: 'A little cloud in headphones, resting on a crescent moon and gently raining music notes.' },
  'the-golden-revivalist': { name: 'Goldie', bio: 'A golden retriever in a sequin disco jacket, mid-boogie, spinning a mirror ball on one paw.' },
  'the-vintage-enthusiast': { name: 'Tweed', bio: 'A tortoise whose shell grew a gramophone horn, sipping tea with its eyes closed.' },
  'the-restless-romantic': { name: 'Rosso', bio: 'A fox striking a flamenco pose, a rose in its teeth and a vinyl record for a fan.' },
  'the-sentimental-archivist': { name: 'Sepia', bio: 'An owl in a cardigan hugging a stack of 45s, round glasses all fogged up.' },
  'the-playlist-hopper': { name: 'Hopscotch', bio: 'A frog leaping between floating lily pads, each one a different album cover.' },
  'the-easy-explorer': { name: 'Peach', bio: 'A capybara floating in a record-shaped pool ring, one earbud in and a peach on its head.' },
  'the-chaos-seeker': { name: 'Riot', bio: 'A raccoon crowd-surfing in a shopping cart full of speakers, grinning at the storm.' },
  'the-moody-mixer': { name: 'Shade', bio: 'A chameleon DJ whose stripes shift with every moody track, chin resting on the mixer.' },
  'the-retro-nomad': { name: 'Rusty', bio: 'A camel on roller skates with a boombox strapped to its hump.' },
  'the-gentle-nostalgic': { name: 'Honey', bio: 'A bear in a rocking chair with a transistor radio in its lap.' },
  'the-haunted-dj': { name: 'Baron', bio: 'A vampire bat in a cape, scratching a dusty turntable by candlelight.' },
  'the-fading-wanderer': { name: 'Mist', bio: 'A moth carrying a lantern, wings patterned like faded cassette labels.' },
  'the-indie-devotee': { name: 'Patch', bio: 'A hedgehog with guitar-pick spines, jumping with a tote bag covered in band pins.' },
  'the-ambient-collector': { name: 'Echo', bio: 'An axolotl holding a jar of glowing soundwaves like fireflies.' },
  'the-subculture-rebel': { name: 'Spike', bio: 'A porcupine in a safety-pin vest, yelling (politely) into a megaphone.' },
  'the-shadow-curator': { name: 'Inky', bio: 'An octopus in a monocle, hanging tiny dark album covers in a candlelit gallery.' },
  'the-vintage-explorer': { name: 'Copper', bio: 'An armadillo in a pith helmet, metal-detecting records out of the sand.' },
  'the-gentle-historian': { name: 'Sage', bio: 'A snail whose shell is a coiled French horn, reading liner notes through a magnifying glass.' },
  'the-underground-romantic': { name: 'Ember', bio: 'A ferret serenading with a tiny accordion under a single streetlamp.' },
  'the-obscure-archivist': { name: 'Burrow', bio: 'A mole in a tunnel lined with records, ticking them off a clipboard by candlelight.' },
  'the-sonic-wanderer': { name: 'Zip', bio: 'A hummingbird darting between flowers whose blooms are little speakers.' },
  'the-modern-daydreamer': { name: 'Cumulo', bio: 'A whale floating through the clouds with tiny earbuds in.' },
  'the-noise-nomad': { name: 'Static', bio: 'A gremlin robot built from guitar pedals, sparking and headbanging.' },
  'the-fadeaway-listener': { name: 'Wisp', bio: 'A dandelion-seed spirit drifting off on the breeze, one note trailing behind.' },
  'the-eclectic-retrohead': { name: 'Mixtape', bio: 'A magpie dancing in a nest built from cassettes and shiny 45s.' },
  'the-vinyl-drifter': { name: 'Dinghy', bio: 'A sleepy paper boat sailing slow circles on a record that has become a pond.' },
  'the-obscure-punk': { name: 'Thorn', bio: 'A cactus with a spiky mohawk, a denim vest and an old cassette Walkman.' },
  'the-lost-listener': { name: 'Fog', bio: 'A koala clinging to an old radio antenna, half asleep and wistful.' },
  'the-pop-loyalist': { name: 'Glitter', bio: 'A flamingo superfan with a lightstick and a homemade banner, mid-cheer.' },
  'the-chart-regular': { name: 'Mochi', bio: 'A hamster on a tiny sofa, earbuds in, holding a handwritten top-10 list.' },
  'the-modern-melancholic': { name: 'Velvet', bio: 'A baby dragon belting into a mic, breathing a small flame of heartbreak.' },
  'the-brooding-fan': { name: 'Mauve', bio: 'A crow in an oversized hoodie, lit by phone glow in bed, one earbud in.' },
  'the-classic-loyalist': { name: 'Sunny', bio: 'A chick with a pompadour, jiving in front of a jukebox.' },
  'the-vintage-devotee': { name: 'Biscuit', bio: 'A pug curled up beside a record player and the same three well-loved records.' },
  'the-dramatic-traditionalist': { name: 'Diva', bio: 'A swan in an opera cape and a tiny crown, one wing raised to the spotlight.' },
  'the-melancholy-purist': { name: 'Droop', bio: 'A basset hound playing the same record again while rain runs down the window.' },
  'the-mainstream-hopper': { name: 'Fizz', bio: 'A grasshopper bouncing on radio waves, phone in hand.' },
  'the-easy-listener': { name: 'Marsh', bio: 'A marshmallow bunny dozing in a hammock, one earbud in.' },
  'the-doom-dancer': { name: 'Grim', bio: 'A tiny reaper dancing in a club, its scythe swapped for a glowstick.' },
  'the-lofi-drifter': { name: 'Loaf', bio: 'A cat in perfect loaf shape with headphones on, rain on the window behind.' },
  'the-retro-socialite': { name: 'Cherry', bio: 'A poodle at the roller disco with a boombox shaped like a cherry.' },
  'the-classic-radio-fan': { name: 'Dial', bio: 'A canary perched on a vintage tabletop radio, singing along.' },
  'the-torchbearer': { name: 'Blaze', bio: 'A red panda holding a lighter aloft at a concert, crying and grinning at once.' },
  'the-reflective-listener': { name: 'Pebble', bio: 'A heron standing very still in a pond, next to a radio floating on a lily pad.' },
  'the-minimalist-creator': { name: 'Cube', bio: 'A penguin building a beat on a single tiny synth, clean and confident.' },
  'the-soft-collector': { name: 'Moss', bio: 'A tardigrade (a moss piglet) curled protectively around one cherished cassette.' },
  'the-niche-rebel': { name: 'Fang', bio: 'A wolf pup in a studded jacket, howling at a red moon.' },
  'the-shadow-follower': { name: 'Smoke', bio: 'A lemur with huge lantern eyes, following a single glowing note through the dark.' },
  'the-revival-purist': { name: 'Brass', bio: 'A beetle with a trumpet-bell horn, polishing it with a grin.' },
  'the-vintage-collector': { name: 'Lace', bio: 'A mouse in a tiny record shop, holding up one beloved LP.' },
  'the-obscure-devotee': { name: 'Abyss', bio: 'An anglerfish whose lure is a glowing record, singing in the deep.' },
  'the-preservationist': { name: 'Acorn', bio: 'A squirrel tucking records into a tree hollow for safekeeping.' },
  'the-curious-casual': { name: 'Pip', bio: 'A duckling peeking curiously into a speaker cone.' },
  'the-gentle-dabbler': { name: 'Flutter', bio: 'A butterfly landing on a flower wearing headphones.' },
  'the-glitch-drifter': { name: 'Byte', bio: 'A pixel slime glitching in and out, little bits floating off.' },
  'the-quiet-ghost': { name: 'Hush', bio: 'A sheet ghost peeking around a door, earbud cords dangling.' },
  'the-retro-casual': { name: 'Sherbet', bio: 'A hermit crab whose shell is a cassette tape, doing a sideways shuffle.' },
  'the-soft-traditionalist': { name: 'Linen', bio: 'A sheep knitting a scarf out of cassette tape beside an old radio.' },
  'the-restless-historian': { name: 'Scramble', bio: 'A mountain goat leaping between stacks of old records like cliffs.' },
  'the-fading-whisperer': { name: 'Dusk', bio: 'A firefly whose light flickers in time with a faraway old song.' },
};

export function personaPortrait(personaId: string): string {
  return `/personas/${personaId}.webp`;
}

export function getPersonaCharacter(personaId: string): PersonaCharacter | undefined {
  return PERSONA_CHARACTERS[personaId];
}
