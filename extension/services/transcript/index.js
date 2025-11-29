import { getPlayerResponse, extractCaptionTracks } from './parser.js';
import { fetchTranscript as fetchTranscriptFromFetcher } from './fetcher.js';

import { formatAsPlainText, formatWithTimestamps } from './formatter.js';

export function getAvailableCaptions() {
  const playerResponse = getPlayerResponse();
  return extractCaptionTracks(playerResponse);
}

export async function fetchTranscript(videoId, languageCode) {
  if (!videoId) {
    throw new Error('Video ID is required');
  }

  return fetchTranscriptFromFetcher(videoId, languageCode);
}

export async function getTranscriptText(languageCode, includeTimestamps = false) {
  const segments = await fetchTranscript(languageCode);

  return includeTimestamps ? formatWithTimestamps(segments) : formatAsPlainText(segments);
}

export function hasCaptions() {
  const tracks = getAvailableCaptions();
  return tracks.length > 0;
}
