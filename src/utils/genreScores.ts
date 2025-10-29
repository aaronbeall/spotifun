import { VACRSScore } from "@/types";

// Type for a bucket of genres/descriptors with their scores
type ScoreBucket = {
  // The VACRS score for this bucket
  score: number;
  // Genres that fit this bucket
  genres: string[];
  // Descriptors that fit this bucket (adjectives, moods, etc.)
  descriptors: string[];
};

type DimensionScores = {
  [key in keyof VACRSScore]: ScoreBucket[];
};

export const GENRE_SCORES: DimensionScores = {
  // Valence: emotional tone (0 = sad/negative, 1 = happy/positive)
  valence: [
    {
      score: 0.1,
      genres: [
        // Extreme metal and dark genres
        "funeral doom", "black metal", "death doom", "dark ambient", "drone metal",
        "atmospheric black metal", "depressive suicidal black metal", "funeral doom metal",
        "dark jazz", "dark folk", "darkwave", "witch house", "horrorcore", "noise", "power electronics",
        "dark electro", "dark techno", "darkwave", "ethereal wave", "neofolk", "neoclassical darkwave",
        "gothic metal", "gothic rock", "dark cabaret", "dark synthpop", "dark psytrance"
      ],
      descriptors: ["despairing", "bleak", "harrowing", "tortured", "angst-ridden", "nihilistic",
                   "funereal", "mournful", "desolate", "abyssal", "chilling", "unsettling", "sinister"]
    },
    {
      score: 0.3,
      genres: [
        // Melancholic and introspective genres
        "post-punk", "sadcore", "slowcore", "shoegaze", "dream pop", "blackgaze", "post-metal",
        "post-rock", "dark folk", "neofolk", "slowcore", "sad rap", "emo rap", "cloud rap",
        "lo-fi hip hop", "ambient pop", "ethereal wave", "coldwave", "minimal wave", "witch house",
        "slowcore", "sad lofi", "bedroom pop", "indie folk", "singer-songwriter", "contemporary folk"
      ],
      descriptors: ["melancholic", "wistful", "nostalgic", "brooding", "pensive", "yearning",
                   "haunting", "atmospheric", "ethereal", "dreamy", "introspective", "contemplative"]
    },
    {
      score: 0.5,
      genres: [
        // Neutral and balanced genres
        "ambient", "post-rock", "indie folk", "singer-songwriter", "jazz", "contemporary jazz",
        "modern classical", "minimal techno", "deep house", "trip hop", "downtempo", "chillhop",
        "lo-fi beats", "indie rock", "alternative r&b", "neo-soul", "indie pop", "art pop",
        "experimental pop", "art rock", "math rock", "post-bop", "cool jazz", "smooth jazz",
        "new age", "chillout", "ambient techno", "microhouse", "minimal tech", "deep tech"
      ],
      descriptors: ["balanced", "neutral", "reflective", "thoughtful", "mellow", "smooth",
                   "soothing", "hypnotic", "textured", "layered", "evocative", "atmospheric"]
    },
    {
      score: 0.7,
      genres: [
        // Upbeat and positive genres
        "pop", "r&b", "soul", "reggae", "afrobeats", "afropop", "dancehall", "reggaeton",
        "tropical house", "indie pop", "synthpop", "electropop", "disco", "funk", "neo-soul",
        "city pop", "jazz fusion", "latin jazz", "bossa nova", "samba", "salsa", "merengue",
        "k-pop", "j-pop", "city pop", "shibuya-kei", "future funk", "vaporwave", "lo-fi house"
      ],
      descriptors: ["upbeat", "warm", "positive", "chill", "groovy", "smooth", "lively",
                   "vibrant", "sunny", "carefree", "playful", "sensual", "romantic"]
    },
    {
      score: 0.9,
      genres: [
        // Euphoric and extremely positive genres
        "bubblegum pop", "happy hardcore", "kawaii future bass", "j-pop", "anime", "j-core",
        "eurodance", "hands up", "jumpstyle", "hardstyle", "happy hardcore", "uk hardcore",
        "bubblegum dance", "eurobeat", "j-euro", "kawaii metal", "kawaii edm", "future bass",
        "future pop", "electro swing", "nu-disco", "disco house", "funky house", "tropical house",
        "moombahton", "moombahcore", "jump up", "melodic dubstep", "glitch hop", "complextro"
      ],
      descriptors: ["euphoric", "joyful", "cheerful", "upbeat", "happy", "ecstatic", "exuberant",
                   "energetic", "vibrant", "playful", "whimsical", "kawaii", "sparkling", "radiant"]
    }
  ],

  // Arousal: energy level (0 = calm, 1 = energetic)
  arousal: [
    {
      score: 0.1,
      genres: [
        // Extremely low energy
        "ambient", "drone", "dark ambient", "isolationism", "lowercase", "minimal", "microsound",
        "glitch", "field recordings", "soundscape", "environmental", "nature sounds", "sleep",
        "meditation", "new age", "space ambient", "dark jazz", "jazz ambient", "chillout",
        "lo-fi beats", "jazzhop", "ambient dub", "illbient", "illbient", "illbient", "illbient"
      ],
      descriptors: ["calm", "soothing", "meditative", "peaceful", "tranquil", "serene", "still",
                   "floating", "ethereal", "hypnotic", "minimal", "sparse", "expansive"]
    },
    {
      score: 0.3,
      genres: [
        // Low to medium energy
        "lo-fi", "chillhop", "jazz", "folk", "singer-songwriter", "acoustic", "neoclassical",
        "modern classical", "chamber pop", "baroque pop", "sophisti-pop", "soft rock", "yacht rock",
        "smooth jazz", "bossa nova", "latin jazz", "acid jazz", "nu jazz", "jazz fusion",
        "trip hop", "downtempo", "lounge", "easy listening", "ambient pop", "dream pop",
        "slowcore", "sadcore", "bedroom pop", "indie folk", "americana", "bluegrass", "country"
      ],
      descriptors: ["relaxed", "laid-back", "gentle", "smooth", "mellow", "leisurely", "unhurried",
                   "easygoing", "comfortable", "cozy", "intimate", "warm", "inviting"]
    },
    {
      score: 0.5,
      genres: [
        // Medium energy
        "indie pop", "indie rock", "alternative rock", "britpop", "jangle pop", "power pop",
        "pop rock", "soft rock", "folk rock", "country rock", "southern rock", "blues rock",
        "reggae", "dub", "reggae fusion", "roots reggae", "lovers rock", "dancehall", "afrobeats",
        "afropop", "highlife", "palm-wine", "rumba", "soukous", "benga", "kizomba", "zouk",
        "bossa nova", "samba", "baião", "forró", "mpb", "tropicalia", "chicha", "cumbia"
      ],
      descriptors: ["moderate", "steady", "balanced", "groovy", "rhythmic", "engaging", "involving",
                   "accessible", "approachable", "familiar", "comfortable", "reassuring"]
    },
    {
      score: 0.7,
      genres: [
        // High energy
        "rock", "pop", "hip hop", "house", "disco", "funk", "soul", "r&b", "neo-soul", "indie dance",
        "nu-disco", "indietronica", "synthpop", "electropop", "dance-pop", "europop", "bubblegum pop",
        "k-pop", "j-pop", "c-pop", "mandopop", "cantopop", "city pop", "shibuya-kei", "future funk",
        "vaporwave", "synthwave", "retro electro", "electroclash", "electro house", "progressive house",
        "tech house", "deep house", "tribal house", "afro house", "gqom", "amapiano", "afro tech"
      ],
      descriptors: ["energetic", "lively", "upbeat", "vibrant", "dynamic", "pulsing", "driving",
                   "rhythmic", "danceable", "groovy", "funky", "soulful", "infectious"]
    },
    {
      score: 0.9,
      genres: [
        // Extremely high energy
        "metal", "hardcore", "punk", "drum and bass", "techno", "hard techno", "industrial techno",
        "acid techno", "hardstyle", "hardcore", "happy hardcore", "uk hardcore", "freeform hardcore",
        "gabber", "speedcore", "extratone", "splittercore", "flashcore", "speedbass", "j-core",
        "breakcore", "jungle", "drumfunk", "footwork", "juke", "ghetto house", "ghettotech",
        "baltimore club", "jersey club", "footwork", "gqom", "kuduro", "tarraxo", "afro house",
        "amapiano", "afro tech", "psytrance", "goa trance", "dark psy", "progressive psy", "full on",
        "hi-tech", "psycore", "suomisaundi", "forest psy", "zenonesque", "dark prog", "psybreaks"
      ],
      descriptors: ["intense", "frantic", "explosive", "hyper", "ferocious", "relentless", "driving",
                   "pounding", "pulsing", "energetic", "adrenaline-fueled", "high-octane", "frenetic"]
    }
  ],

  // Complexity: musical complexity (0 = simple, 1 = complex)
  complexity: [
    {
      score: 0.1,
      genres: [
        // Extremely simple
        "minimal", "drone", "ambient", "lo-fi", "chillhop", "lofi hip hop", "lofi beats",
        "study beats", "sleep", "meditation", "white noise", "brown noise", "pink noise",
        "field recordings", "nature sounds", "soundscape", "environmental", "lowercase",
        "onkyo", "microsound", "glitch", "clickhop", "microhouse", "minimal techno",
        "deep house", "tech house", "ambient techno", "deep tech", "minimal dub"
      ],
      descriptors: ["minimal", "repetitive", "sparse", "simple", "stripped-down", "bare",
                   "unadorned", "elemental", "essential", "fundamental", "basic"]
    },
    {
      score: 0.3,
      genres: [
        // Simple and accessible
        "pop", "hip hop", "edm", "dance-pop", "electropop", "bubblegum pop", "k-pop", "j-pop",
        "city pop", "shibuya-kei", "future funk", "vaporwave", "synthwave", "retro electro",
        "disco", "funk", "soul", "r&b", "neo-soul", "contemporary r&b", "trap", "drill",
        "cloud rap", "emo rap", "soundcloud rap", "pluggnb", "rage", "hyperpop", "digicore",
        "glitchcore", "breakcore", "jungle terror", "gqom", "amapiano", "afro tech", "afro house"
      ],
      descriptors: ["simple", "catchy", "accessible", "direct", "immediate", "hooky", "memorable",
                   "earworm", "singable", "danceable", "groovy", "rhythmic", "pulsing"]
    },
    {
      score: 0.5,
      genres: [
        // Moderate complexity
        "rock", "indie", "folk", "country", "blues", "reggae", "dancehall", "reggaeton",
        "afrobeats", "afropop", "highlife", "palm-wine", "rumba", "soukous", "benga", "kizomba",
        "zouk", "bossa nova", "samba", "baião", "forró", "mpb", "tropicalia", "chicha", "cumbia",
        "vallenato", "merengue", "bachata", "salsa", "son cubano", "timba", "mambo", "cha-cha-cha"
      ],
      descriptors: ["balanced", "traditional", "standard", "familiar", "accessible", "engaging",
                   "well-crafted", "well-structured", "cohesive", "harmonious", "melodic", "rhythmic"]
    },
    {
      score: 0.7,
      genres: [
        // High complexity
        "prog", "jazz", "classical", "math rock", "post-rock", "post-metal", "post-punk",
        "art rock", "art pop", "baroque pop", "chamber pop", "orchestral pop", "symphonic rock",
        "symphonic metal", "power metal", "neoclassical metal", "djent", "progressive metal",
        "technical death metal", "avant-garde metal", "jazz fusion", "progressive rock",
        "krautrock", "krautrock", "krautrock", "krautrock", "krautrock", "krautrock"
      ],
      descriptors: ["complex", "intricate", "detailed", "sophisticated", "nuanced", "layered",
                   "textured", "orchestrated", "arranged", "composed", "structured", "developed"]
    },
    {
      score: 0.9,
      genres: [
        // Extremely complex
        "avant-garde", "free jazz", "noise", "contemporary classical", "modern classical",
        "impressionist", "expressionist", "serialism", "minimalism", "spectralism", "microtonal",
        "experimental", "sound art", "electroacoustic", "musique concrète", "acousmatic",
        "computer music", "algorithmic composition", "generative music", "stochastic music",
        "chance music", "aleatoric music", "indeterminacy", "graphic notation", "text score",
        "fluxus", "happening", "performance art", "sound installation", "sound sculpture"
      ],
      descriptors: ["dense", "challenging", "experimental", "avant-garde", "unconventional",
                   "unorthodox", "unpredictable", "unsettling", "disorienting", "fragmented",
                   "abstract", "conceptual", "theoretical", "intellectual", "academic"]
    }
  ],

  // Rawness: production quality (0 = polished, 1 = raw/lo-fi)
  rawness: [
    {
      score: 0.1,
      genres: [
        // Highly polished
        "pop", "edm", "synthpop", "dance-pop", "electropop", "bubblegum pop", "k-pop", "j-pop",
        "city pop", "shibuya-kei", "future funk", "vaporwave", "synthwave", "retro electro",
        "eurodance", "hands up", "jumpstyle", "hardstyle", "happy hardcore", "uk hardcore",
        "bubblegum dance", "eurobeat", "j-euro", "kawaii metal", "kawaii edm", "future bass",
        "future pop", "electro swing", "nu-disco", "disco house", "funky house", "tropical house"
      ],
      descriptors: ["polished", "clean", "shiny", "pristine", "sleek", "smooth", "glossy", "slick",
                   "refined", "processed", "compressed", "loud", "bright", "crisp", "clear"]
    },
    {
      score: 0.3,
      genres: [
        // Well-produced but with character
        "r&b", "hip hop", "indie pop", "indie rock", "alternative rock", "britpop", "jangle pop",
        "power pop", "pop rock", "soft rock", "folk rock", "country rock", "southern rock",
        "blues rock", "reggae", "dub", "reggae fusion", "roots reggae", "lovers rock", "dancehall",
        "afrobeats", "afropop", "highlife", "palm-wine", "rumba", "soukous", "benga", "kizomba",
        "zouk", "bossa nova", "samba", "baião", "forró", "mpb", "tropicalia", "chicha", "cumbia"
      ],
      descriptors: ["slick", "produced", "refined", "professional", "commercial", "radio-friendly",
                   "accessible", "mainstream", "polished", "smooth", "shiny", "bright", "clear"]
    },
    {
      score: 0.5,
      genres: [
        // Balanced production
        "rock", "jazz", "soul", "funk", "disco", "r&b", "neo-soul", "contemporary r&b", "trap",
        "drill", "cloud rap", "emo rap", "soundcloud rap", "pluggnb", "rage", "hyperpop", "digicore",
        "glitchcore", "breakcore", "jungle terror", "gqom", "amapiano", "afro tech", "afro house",
        "techno", "house", "tech house", "deep house", "progressive house", "tribal house", "afro house"
      ],
      descriptors: ["balanced", "natural", "organic", "warm", "analog", "vintage", "retro", "classic",
                   "timeless", "authentic", "genuine", "honest", "sincere", "heartfelt", "emotional"]
    },
    {
      score: 0.7,
      genres: [
        // Raw and unpolished
        "punk", "garage rock", "lo-fi", "indie", "alternative", "grunge", "slacker rock", "shoegaze",
        "noise pop", "noise rock", "post-punk", "post-rock", "post-metal", "blackgaze", "slowcore",
        "sadcore", "emo", "midwest emo", "screamo", "skramz", "post-hardcore", "math rock", "mathcore",
        "grindcore", "powerviolence", "thrash metal", "crossover thrash", "crack rock steady", "folk punk",
        "cowpunk", "psychobilly", "horror punk", "deathrock", "darkwave", "coldwave", "minimal wave"
      ],
      descriptors: ["raw", "gritty", "unpolished", "rough", "edgy", "aggressive", "intense", "angry",
                   "rebellious", "defiant", "confrontational", "challenging", "uncompromising", "honest"]
    },
    {
      score: 0.9,
      genres: [
        // Extremely raw and lo-fi
        "noise", "black metal", "field recordings", "harsh noise", "power electronics", "industrial",
        "martial industrial", "dark ambient", "drone", "dark jazz", "jazzcore", "free jazz", "avant-jazz",
        "no wave", "noise rock", "noise pop", "lo-fi", "bedroom pop", "bedroom rock", "outsider music",
        "outsider house", "outsider techno", "outsider hip hop", "outsider pop", "outsider rock",
        "outsider folk", "outsider country", "outsider jazz", "outsider classical", "outsider electronic"
      ],
      descriptors: ["harsh", "lo-fi", "unrefined", "rough", "primitive", "primal", "tribal", "ritualistic",
                   "primal", "elemental", "visceral", "physical", "bodily", "carnal", "animalistic"]
    }
  ],

  // Social Presence: context (0 = solitary, 1 = communal)
  socialPresence: [
    {
      score: 0.1,
      genres: [
        // Solitary and introspective
        "ambient", "drone", "dark ambient", "isolationism", "lowercase", "minimal", "microsound",
        "glitch", "field recordings", "soundscape", "environmental", "nature sounds", "sleep",
        "meditation", "new age", "space ambient", "dark jazz", "jazz ambient", "chillout",
        "lo-fi beats", "jazzhop", "ambient dub", "illbient", "illbient", "illbient", "illbient"
      ],
      descriptors: ["solitary", "introspective", "personal", "private", "intimate", "meditative",
                   "contemplative", "reflective", "thoughtful", "pensive", "dreamy", "ethereal"]
    },
    {
      score: 0.3,
      genres: [
        // Intimate and personal
        "singer-songwriter", "folk", "bedroom pop", "indie folk", "singer-songwriter", "acoustic",
        "neoclassical", "modern classical", "chamber pop", "baroque pop", "sophisti-pop", "soft rock",
        "yacht rock", "smooth jazz", "bossa nova", "latin jazz", "acid jazz", "nu jazz", "jazz fusion",
        "trip hop", "downtempo", "lounge", "easy listening", "ambient pop", "dream pop", "slowcore",
        "sadcore", "bedroom pop", "indie folk", "americana", "bluegrass", "country", "alt-country"
      ],
      descriptors: ["intimate", "personal", "reflective", "confessional", "honest", "sincere",
                   "heartfelt", "emotional", "vulnerable", "raw", "unfiltered", "unvarnished"]
    },
    {
      score: 0.5,
      genres: [
        // Balanced social context
        "indie", "alternative", "jazz", "rock", "indie rock", "alternative rock", "britpop",
        "jangle pop", "power pop", "pop rock", "soft rock", "folk rock", "country rock",
        "southern rock", "blues rock", "reggae", "dub", "reggae fusion", "roots reggae",
        "lovers rock", "dancehall", "afrobeats", "afropop", "highlife", "palm-wine", "rumba",
        "soukous", "benga", "kizomba", "zouk", "bossa nova", "samba", "baião", "forró", "mpb"
      ],
      descriptors: ["balanced", "versatile", "adaptable", "flexible", "all-purpose", "all-around",
                   "well-rounded", "well-balanced", "even-handed", "fair", "impartial", "neutral"]
    },
    {
      score: 0.7,
      genres: [
        // Social and engaging
        "pop", "hip hop", "r&b", "neo-soul", "contemporary r&b", "trap", "drill", "cloud rap",
        "emo rap", "soundcloud rap", "pluggnb", "rage", "hyperpop", "digicore", "glitchcore",
        "breakcore", "jungle terror", "gqom", "amapiano", "afro tech", "afro house", "techno",
        "house", "tech house", "deep house", "progressive house", "tribal house", "afro house"
      ],
      descriptors: ["social", "engaging", "relatable", "friendly", "approachable", "accessible",
                   "inclusive", "welcoming", "inviting", "warm", "hospitable", "gracious"]
    },
    {
      score: 0.9,
      genres: [
        // Highly communal and celebratory
        "punk", "edm", "house", "techno", "party", "dance", "disco", "funk", "soul", "r&b", "neo-soul",
        "contemporary r&b", "trap", "drill", "cloud rap", "emo rap", "soundcloud rap", "pluggnb",
        "rage", "hyperpop", "digicore", "glitchcore", "breakcore", "jungle terror", "gqom",
        "amapiano", "afro tech", "afro house", "techno", "house", "tech house", "deep house",
        "progressive house", "tribal house", "afro house", "trance", "psytrance", "goa trance",
        "dark psy", "progressive psy", "full on", "hi-tech", "psycore", "suomisaundi", "forest psy"
      ],
      descriptors: ["communal", "festive", "celebratory", "joyous", "jubilant", "exuberant",
                   "ecstatic", "euphoric", "rapturous", "elated", "gleeful", "jovial"]
    }
  ]
};
