/** Last.fm pages. Last.fm's API terms ask for links back to the matching catalogue pages. */
const encodePart = (part: string) => encodeURIComponent(part).replace(/%20/g, '+');

export const lastFmArtistUrl = (artist: string) => `https://www.last.fm/music/${encodePart(artist)}`;

export const lastFmTrackUrl = (artist: string, track: string) =>
  `https://www.last.fm/music/${encodePart(artist)}/_/${encodePart(track)}`;

export const lastFmTagUrl = (tag: string) => `https://www.last.fm/tag/${encodePart(tag.toLowerCase())}`;

export const lastFmUserUrl = (username: string) => `https://www.last.fm/user/${encodeURIComponent(username)}`;
