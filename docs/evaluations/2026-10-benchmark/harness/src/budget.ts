import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { PRICES, REGIONAL_MULTIPLIER } from "./config.ts";

export type UsageLike = {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number | null;
  cache_read_input_tokens?: number | null;
  cache_creation?: { ephemeral_5m_input_tokens: number; ephemeral_1h_input_tokens: number } | null;
  inference_geo?: string | null;
  output_tokens_details?: { thinking_tokens: number } | null;
};

export type LedgerEntry = {
  ts: string;
  phase: string;
  kind: "answer" | "grade";
  job: string;
  request: number;
  model: string;
  outcome: "ok" | "failed";
  usage: UsageLike | null;
  cost_usd: number;
  note?: string;
};

export class BudgetExceeded extends Error {}

const perToken = (usdPerMillion: number) => usdPerMillion / 1_000_000;

/** Regional and multi-region inference is billed at a premium; global or unreported is standard. */
export function geoMultiplier(geo: string | null | undefined): number {
  return geo && geo !== "global" ? REGIONAL_MULTIPLIER : 1;
}

/** Dollar cost of one response from its reported usage at the published rates. */
export function priceUsage(usage: UsageLike): number {
  const written = usage.cache_creation_input_tokens ?? 0;
  const oneHour = usage.cache_creation?.ephemeral_1h_input_tokens ?? 0;
  const fiveMinute = usage.cache_creation ? usage.cache_creation.ephemeral_5m_input_tokens : written;
  const base =
    usage.input_tokens * perToken(PRICES.input) +
    fiveMinute * perToken(PRICES.cacheWrite5m) +
    oneHour * perToken(PRICES.cacheWrite1h) +
    (usage.cache_read_input_tokens ?? 0) * perToken(PRICES.cacheRead) +
    usage.output_tokens * perToken(PRICES.output);
  return base * geoMultiplier(usage.inference_geo);
}

/**
 * Upper bound for one request: every request character counted as a token
 * (tokens average well over one character) priced at the 5-minute cache-write
 * rate, plus the full output allowance, with the regional premium.
 */
export function worstCase(requestChars: number, maxTokens: number): number {
  return (requestChars * perToken(PRICES.cacheWrite5m) + maxTokens * perToken(PRICES.output)) * REGIONAL_MULTIPLIER;
}

export type Reservation = { id: number; amount: number };

/** Append-only ledger with a hard cap enforced before each request. */
export class Budget {
  spent = 0;
  reserved = 0;
  private next = 0;
  private open = new Map<number, number>();

  constructor(
    readonly cap: number,
    private readonly ledgerPath: string | null,
  ) {
    if (ledgerPath && existsSync(ledgerPath)) {
      for (const line of readFileSync(ledgerPath, "utf8").split("\n")) {
        if (line.trim()) this.spent += (JSON.parse(line) as LedgerEntry).cost_usd;
      }
    }
  }

  remaining(): number {
    return this.cap - this.spent - this.reserved;
  }

  /** Refuses any request whose worst case could take total spend past the cap. */
  reserve(amount: number): Reservation {
    if (this.spent + this.reserved + amount > this.cap) {
      throw new BudgetExceeded(
        `refused: spent $${this.spent.toFixed(4)} + reserved $${this.reserved.toFixed(4)} + request $${amount.toFixed(4)} exceeds cap $${this.cap.toFixed(2)}`,
      );
    }
    const id = this.next++;
    this.open.set(id, amount);
    this.reserved += amount;
    return { id, amount };
  }

  /** Records the actual cost of a finished request and releases its reservation. */
  settle(reservation: Reservation, entry: Omit<LedgerEntry, "ts" | "cost_usd">, cost: number): number {
    if (!this.open.delete(reservation.id)) throw new Error(`reservation ${reservation.id} already settled`);
    this.reserved -= reservation.amount;
    this.spent += cost;
    const line: LedgerEntry = { ts: new Date().toISOString(), ...entry, cost_usd: cost };
    if (this.ledgerPath) appendFileSync(this.ledgerPath, `${JSON.stringify(line)}\n`);
    return cost;
  }
}
