function ensureLeadingAt(username: string): string {
  return username.startsWith('@') ? username : `@${username}`;
}

export function buildSearchUrlForKeyword(keyword: string): string {
  const q = encodeURIComponent(keyword.replace(/^#/, ''));
  // Keyword search page
  return `https://www.tiktok.com/search?q=${q}`;
}

export function buildHashtagUrl(tag: string): string {
  const clean = tag.replace(/^#/, '');
  const q = encodeURIComponent(clean);
  return `https://www.tiktok.com/tag/${q}`;
}

export function isHashtag(term: string): boolean {
  return term.trim().startsWith('#');
}

export function buildProfileUrl(username: string): string {
  const u = encodeURIComponent(ensureLeadingAt(username));
  return `https://www.tiktok.com/${u}`;
}

export function buildVideoUrl(videoId: string, username?: string): string {
  if (username) {
    return `https://www.tiktok.com/${ensureLeadingAt(username)}/video/${encodeURIComponent(videoId)}`;
  }
  return `https://www.tiktok.com/video/${encodeURIComponent(videoId)}`;
}


