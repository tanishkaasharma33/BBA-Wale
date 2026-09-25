/**
 * Deterministic & Realistic SHA-256 hash generator and crypto helpers for VAULT simulator.
 */

// Simple deterministic string hash for fallback/synchronous simulation
export function generateChecksum(input: string, salt: string = ''): string {
  const str = input + salt;
  let hash1 = 0xdeadbeef ^ 0;
  let hash2 = 0x41c6ce57 ^ 0;

  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash1 = Math.imul(hash1 ^ ch, 2654435761);
    hash2 = Math.imul(hash2 ^ ch, 1597334677);
  }

  hash1 = Math.imul(hash1 ^ (hash1 >>> 16), 2246822507);
  hash1 ^= Math.imul(hash2 ^ (hash2 >>> 13), 3266489909);
  hash2 = Math.imul(hash2 ^ (hash2 >>> 16), 2246822507);
  hash2 ^= Math.imul(hash1 ^ (hash1 >>> 13), 3266489909);

  const hex1 = (4294967296 + hash1).toString(16).slice(-8);
  const hex2 = (4294967296 + hash2).toString(16).slice(-8);

  // Pad to 64 character SHA-256 lookalike
  const segment = (hex1 + hex2).toLowerCase();
  return (segment + segment + segment + segment).slice(0, 64);
}

/**
 * Asynchronously compute authentic SHA-256 if browser crypto is available,
 * with synchronous fallback.
 */
export async function calculateSHA256(content: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const msgUint8 = new TextEncoder().encode(content);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      return generateChecksum(content);
    }
  }
  return generateChecksum(content);
}

/**
 * Introduces subtle bit rot / byte corruption to simulate silent disk degradation.
 * Replaces 4 distinct characters to create an unmistakable checksum mismatch.
 */
export function corruptChecksumString(validChecksum: string): string {
  if (!validChecksum || validChecksum.length < 10) {
    return 'bad00000deadbeef' + generateChecksum('corrupted').slice(16);
  }
  const chars = validChecksum.split('');
  // Flip character at index 4, 12, and 28
  chars[4] = chars[4] === 'f' ? '0' : 'f';
  chars[12] = chars[12] === 'a' ? '9' : 'a';
  chars[28] = chars[28] === 'e' ? '1' : 'e';
  chars[36] = chars[36] === '7' ? 'c' : '7';
  return chars.join('');
}

export function formatBytes(mb: number): string {
  if (mb < 1) {
    return `${Math.round(mb * 1024)} KB`;
  }
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(2)} GB`;
  }
  return `${mb.toFixed(1)} MB`;
}

export function formatTimeAgo(timestampMs: number, nowMs: number = Date.now()): string {
  const diffSec = Math.max(0, Math.floor((nowMs - timestampMs) / 1000));
  if (diffSec < 2) return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  return `${diffHours}h ago`;
}

export function truncateHash(hash: string, lead: number = 8, trail: number = 6): string {
  if (!hash) return '';
  if (hash.length <= lead + trail) return hash;
  return `${hash.slice(0, lead)}...${hash.slice(-trail)}`;
}
