const SUFFIX_MAP: Record<string, number> = {
  k: 1_000,
  m: 1_000_000,
  b: 1_000_000_000,
};

export function parseTikTokNumber(input: string | number | undefined | null): number {
  if (input == null) return 0;
  if (typeof input === 'number') return input;
  const raw = input.toString().trim().toLowerCase();
  if (!raw) return 0;

  // Normalize separators
  const cleaned = raw.replace(/[,\s]/g, '');
  // Match numbers with optional decimal and suffix like k/m/b
  const match = cleaned.match(/^(\d+(?:\.\d+)?)([kmb])?$/i);
  if (match) {
    const value = parseFloat(match[1]);
    const suffix = (match[2] || '').toLowerCase();
    const mul = SUFFIX_MAP[suffix] ?? 1;
    if (Number.isFinite(value)) return Math.round(value * mul);
  }

  // Fallback: strip non-digits and parse
  const digits = cleaned.replace(/[^0-9]/g, '');
  if (digits) return parseInt(digits, 10);
  return 0;
}

export function extractEmail(text: string | undefined | null): string | undefined {
  if (!text) return undefined;
  // Simple email regex, not exhaustive
  const re = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const match = text.match(re);
  return match?.[0];
}

export function parseDateSafe(input: string | number | Date | undefined | null): string | undefined {
  if (!input) return undefined;
  const d = new Date(input);
  if (isNaN(d.getTime())) return undefined;
  return d.toISOString();
}


