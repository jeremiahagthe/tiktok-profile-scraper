export function waitRandom(minMs: number, maxMs: number): Promise<void> {
  const val = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((r) => setTimeout(r, val));
}

export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  constructor(private readonly maxPerMinute: number) {
    this.tokens = maxPerMinute;
    this.lastRefill = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill; // ms
    const perMs = this.maxPerMinute / 60000;
    const add = elapsed * perMs;
    if (add > 0) {
      this.tokens = Math.min(this.maxPerMinute, this.tokens + add);
      this.lastRefill = now;
    }
  }

  async throttle(): Promise<void> {
    // simple token bucket
    while (true) {
      this.refill();
      if (this.tokens >= 1) {
        this.tokens -= 1;
        return;
      }
      // wait a short time before checking again
      await new Promise((r) => setTimeout(r, 200));
    }
  }
}


