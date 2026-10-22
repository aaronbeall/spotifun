'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown, X } from 'lucide-react';
import { ArtistGenreDebugInfo } from '@/types';

interface GenreDebugPanelProps {
  debugData?: ArtistGenreDebugInfo[];
  overallCoverage?: number;
}

/**
 * Dev-only debug panel for genre classification
 * Only renders when NODE_ENV=development and debugData is present
 * Shows per-artist genre classification details as a bottom drawer
 */
export function GenreDebugPanel({ debugData, overallCoverage }: GenreDebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Only show in development when debug data is present
  if (process.env.NODE_ENV !== 'development' || !debugData || debugData.length === 0) {
    return null;
  }

  return (
    <>
      {/* Toggle Button - Fixed at bottom right */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-50 bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg shadow-xl flex items-center gap-2 transition-all"
          aria-label="Open debug panel"
        >
          <span className="text-lg">🐛</span>
          <span className="text-sm">Genre Debug</span>
          <ChevronUp className="w-4 h-4" />
        </button>
      )}

      {/* Debug Panel - Bottom Drawer */}
      {isOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/98 border-t-4 border-yellow-500 shadow-2xl max-h-[70vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-gray-800/50">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🐛</span>
              <div>
                <h3 className="text-yellow-400 font-bold text-lg">Genre Classification Debug Panel</h3>
                <p className="text-gray-400 text-xs">
                  Development mode only • Overall Coverage: {overallCoverage !== undefined ? `${Math.round(overallCoverage * 100)}%` : 'N/A'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded"
              aria-label="Close debug panel"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-auto p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-gray-800 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-yellow-400 font-semibold border-b border-gray-700">Artist</th>
                    <th className="px-4 py-3 text-yellow-400 font-semibold border-b border-gray-700">Spotify Genres</th>
                    <th className="px-4 py-3 text-yellow-400 font-semibold border-b border-gray-700">Last.fm Tags</th>
                    <th className="px-4 py-3 text-yellow-400 font-semibold border-b border-gray-700">Matched Nodes</th>
                    <th className="px-4 py-3 text-yellow-400 font-semibold border-b border-gray-700">Unmatched</th>
                    <th className="px-4 py-3 text-yellow-400 font-semibold border-b border-gray-700">Match Type</th>
                    <th className="px-4 py-3 text-yellow-400 font-semibold border-b border-gray-700">VACRS Traits</th>
                    <th className="px-4 py-3 text-yellow-400 font-semibold border-b border-gray-700">Coverage</th>
                  </tr>
                </thead>
                <tbody>
                  {debugData.map((debug, i) => {
                    const allGenres = [...debug.spotifyGenres, ...debug.lastFmTagsUsed];
                    const unmatchedGenres = allGenres.filter(g => !debug.matchedNodes.includes(g));
                    
                    return (
                      <tr 
                        key={i} 
                        className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="px-4 py-3 text-white font-medium">{debug.artistName}</td>
                        <td className="px-4 py-3 text-gray-300">
                          {debug.spotifyGenres.length > 0 ? (
                            <span className="text-blue-300">{debug.spotifyGenres.join(', ')}</span>
                          ) : (
                            <span className="text-gray-600">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-purple-300">
                          {debug.lastFmTagsUsed.length > 0 ? debug.lastFmTagsUsed.join(', ') : '—'}
                        </td>
                        <td className="px-4 py-3 text-green-300">
                          {debug.matchedNodes.length > 0 ? debug.matchedNodes.join(', ') : '—'}
                        </td>
                        <td className="px-4 py-3 text-orange-400">
                          {unmatchedGenres.length > 0 ? unmatchedGenres.join(', ') : '—'}
                        </td>
                        <td className="px-4 py-3 text-cyan-300 capitalize">{debug.matchType}</td>
                        <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                          {debug.vacrsScores ? (
                            <div 
                              className="cursor-help"
                              title={`Valence: ${debug.vacrsScores.valence.toFixed(3)} (emotional tone)
Arousal: ${debug.vacrsScores.arousal.toFixed(3)} (energy level)
Complexity: ${debug.vacrsScores.complexity.toFixed(3)} (musical intricacy)
Rawness: ${debug.vacrsScores.rawness.toFixed(3)} (production style)
Social Presence: ${debug.vacrsScores.socialPresence.toFixed(3)} (communal vs solitary)`}
                            >
                              <div>V:{debug.vacrsScores.valence.toFixed(2)}</div>
                              <div>A:{debug.vacrsScores.arousal.toFixed(2)}</div>
                              <div>C:{debug.vacrsScores.complexity.toFixed(2)}</div>
                              <div>R:{debug.vacrsScores.rawness.toFixed(2)}</div>
                              <div>S:{debug.vacrsScores.socialPresence.toFixed(2)}</div>
                            </div>
                          ) : (
                            <span className="text-red-400">No scores</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${
                              debug.coverage >= 0.8 ? 'text-green-400' :
                              debug.coverage >= 0.5 ? 'text-yellow-400' :
                              'text-red-400'
                            }`}>
                              {Math.round(debug.coverage * 100)}%
                            </span>
                            <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${
                                  debug.coverage >= 0.8 ? 'bg-green-500' :
                                  debug.coverage >= 0.5 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${debug.coverage * 100}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <h4 className="text-yellow-400 font-semibold mb-2 text-sm">Legend:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div><span className="text-blue-300 font-semibold">Spotify Genres:</span> From Spotify API</div>
                <div><span className="text-purple-300 font-semibold">Last.fm Tags:</span> From Last.fm when Spotify &lt;= 2 genres</div>
                <div><span className="text-green-300 font-semibold">Matched Nodes:</span> Successfully mapped to taxonomy</div>
                <div><span className="text-orange-400 font-semibold">Unmatched:</span> Genres not in taxonomy</div>
                <div><span className="text-cyan-300 font-semibold">Match Type:</span> exact, parent, keyword, or unknown</div>
                <div><span className="text-gray-400 font-semibold">VACRS:</span> Valence, Arousal, Complexity, Rawness, Social Presence (0-1)</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
