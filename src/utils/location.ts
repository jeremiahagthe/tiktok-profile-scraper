const COUNTRY_KEYWORDS: Record<string, string[]> = {
  US: ['usa', 'united states', 'nyc', 'la', 'california', 'texas'],
  GB: ['uk', 'united kingdom', 'london', 'manchester'],
  CA: ['canada', 'toronto', 'vancouver', 'montreal'],
  AU: ['australia', 'sydney', 'melbourne'],
  DE: ['germany', 'berlin', 'munich', 'deutschland'],
  FR: ['france', 'paris'],
  ES: ['spain', 'madrid', 'barcelona'],
  IT: ['italy', 'rome', 'milan'],
  IN: ['india', 'mumbai', 'delhi', 'bangalore'],
};

export function detectCountryFromText(text?: string): string | undefined {
  if (!text) return undefined;
  const hay = text.toLowerCase();
  for (const [code, words] of Object.entries(COUNTRY_KEYWORDS)) {
    if (words.some((w) => hay.includes(w))) return code;
  }
  return undefined;
}


