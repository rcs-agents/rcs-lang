import LZString from 'lz-string';

/**
 * Compress source code for URL hash sharing
 */
export function encodeSource(source: string): string {
	return LZString.compressToEncodedURIComponent(source);
}

/**
 * Decompress source code from URL hash
 */
export function decodeSource(hash: string): string | null {
	try {
		return LZString.decompressFromEncodedURIComponent(hash);
	} catch {
		return null;
	}
}

/**
 * Get current source from URL hash
 */
export function getSourceFromUrl(): string | null {
	if (typeof window === 'undefined') return null;
	const hash = window.location.hash.slice(1);
	if (!hash) return null;
	return decodeSource(hash);
}

/**
 * Update URL hash with new source
 */
export function updateUrlWithSource(source: string): void {
	if (typeof window === 'undefined') return;
	const compressed = encodeSource(source);
	window.location.hash = compressed;
}
