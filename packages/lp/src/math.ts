export const MIN_TICK = -887272;
export const MAX_TICK = 887272;

export interface RangeInput {
  price: number;
  widthPercent: number;
  tickSpacing: number;
  decimals0?: number;
  decimals1?: number;
}

export interface RangeResult {
  orientation: "token1 per token0";
  tickCurrent: number;
  tickLower: number;
  tickUpper: number;
  requestedPriceLower: number;
  requestedPriceUpper: number;
  snappedPriceLower: number;
  snappedPriceUpper: number;
}

export interface PositionInput {
  tickCurrent: number;
  tickLower: number;
  tickUpper: number;
  edgeBufferTicks?: number;
}

export interface PositionResult {
  state: "below-range" | "in-range" | "above-range";
  inRange: boolean;
  nearEdge: boolean;
  percentThroughRange: number | null;
  distanceToLower: number;
  distanceToUpper: number;
}

export interface EconomicsInput {
  capitalUsd: number;
  feesUsd: number;
  incentivesUsd?: number;
  costsUsd?: number;
  days: number;
}

export interface EconomicsResult {
  grossIncomeUsd: number;
  netIncomeUsd: number;
  periodReturnPercent: number;
  feeAprPercent: number;
  incentiveAprPercent: number;
  netSimpleAprPercent: number;
  costCoverageRatio: number | null;
}

const LN_1_0001 = Math.log(1.0001);
const LN_10 = Math.log(10);

function finite(value: number, field: string): void {
  if (!Number.isFinite(value)) throw new Error(`${field} must be finite`);
}

function nonNegative(value: number, field: string): void {
  finite(value, field);
  if (value < 0) throw new Error(`${field} must be at least 0`);
}

function integer(value: number, field: string): void {
  finite(value, field);
  if (!Number.isInteger(value)) throw new Error(`${field} must be an integer`);
}

function priceToTick(price: number, decimals0: number, decimals1: number): number {
  return (Math.log(price) + (decimals1 - decimals0) * LN_10) / LN_1_0001;
}

function tickToPrice(tick: number, decimals0: number, decimals1: number): number {
  return Math.exp(tick * LN_1_0001 + (decimals0 - decimals1) * LN_10);
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function floatRatio(value: number): { num: bigint; den: bigint } {
  const bytes = new ArrayBuffer(8);
  const floatBits = new Float64Array(bytes);
  const intBits = new BigUint64Array(bytes);
  floatBits[0] = value;
  const bits = intBits[0];
  if (bits === undefined) throw new Error("price must be finite");
  const exponent = Number((bits >> 52n) & 0x7ffn);
  const fraction = bits & ((1n << 52n) - 1n);
  if (exponent === 0) return { num: fraction, den: 1n << 1074n };
  const mantissa = fraction | (1n << 52n);
  const power = exponent - 1023 - 52;
  if (power >= 0) return { num: mantissa << BigInt(power), den: 1n };
  return { num: mantissa, den: 1n << BigInt(-power) };
}

function scaledPriceRatio(price: number, decimals0: number, decimals1: number): { num: bigint; den: bigint } {
  const ratio = floatRatio(price);
  const scale = decimals1 - decimals0;
  if (scale >= 0) return { num: ratio.num * 10n ** BigInt(scale), den: ratio.den };
  return { num: ratio.num, den: ratio.den * 10n ** BigInt(-scale) };
}

// 1.0001^|tick| as an exact ratio is only cheap for modest ticks: at the
// protocol bounds (|tick| up to 887272) the power has millions of digits and
// exhausts BigInt memory. Past this bound the Math.log tick is kept as is.
const EXACT_TICK_CHECK_LIMIT = 20_000;

function priceReachedTick(num: bigint, den: bigint, tick: number): boolean {
  const exponent = BigInt(Math.abs(tick));
  const numeratorBase = tick < 0 ? 10000n : 10001n;
  const denominatorBase = tick < 0 ? 10001n : 10000n;
  return numeratorBase ** exponent * den <= num * denominatorBase ** exponent;
}

function floorTick(price: number, decimals0: number, decimals1: number): number {
  let tick = clamp(Math.floor(priceToTick(price, decimals0, decimals1)), MIN_TICK, MAX_TICK);
  if (Math.abs(tick) >= EXACT_TICK_CHECK_LIMIT) return tick;
  const { num, den } = scaledPriceRatio(price, decimals0, decimals1);
  // Math.log can miss floor(ln(price) / ln(1.0001)) by one tick.
  if (tick < MAX_TICK && priceReachedTick(num, den, tick + 1)) tick += 1;
  else if (tick > MIN_TICK && !priceReachedTick(num, den, tick)) tick -= 1;
  return tick;
}

export function buildRange(input: RangeInput): RangeResult {
  const decimals0 = input.decimals0 ?? 18;
  const decimals1 = input.decimals1 ?? 18;

  finite(input.price, "price");
  finite(input.widthPercent, "widthPercent");
  integer(input.tickSpacing, "tickSpacing");
  integer(decimals0, "decimals0");
  integer(decimals1, "decimals1");

  if (input.price <= 0) throw new Error("price must be greater than 0");
  if (input.widthPercent <= 0 || input.widthPercent >= 100) {
    throw new Error("widthPercent must be greater than 0 and less than 100");
  }
  if (input.tickSpacing <= 0 || input.tickSpacing > MAX_TICK) {
    throw new Error("tickSpacing must be between 1 and 887272");
  }
  if (decimals0 < 0 || decimals0 > 36 || decimals1 < 0 || decimals1 > 36) {
    throw new Error("token decimals must be integers between 0 and 36");
  }

  const requestedPriceLower = input.price * (1 - input.widthPercent / 100);
  const requestedPriceUpper = input.price * (1 + input.widthPercent / 100);
  const rawCurrent = priceToTick(input.price, decimals0, decimals1);
  const rawLower = priceToTick(requestedPriceLower, decimals0, decimals1);
  const rawUpper = priceToTick(requestedPriceUpper, decimals0, decimals1);
  if (rawCurrent < MIN_TICK || rawCurrent > MAX_TICK) {
    throw new Error("price is outside supported tick bounds");
  }
  if (rawLower < MIN_TICK || rawUpper > MAX_TICK) {
    throw new Error("requested price interval exceeds supported tick bounds");
  }
  const minimumUsable = Math.ceil(MIN_TICK / input.tickSpacing) * input.tickSpacing;
  const maximumUsable = Math.floor(MAX_TICK / input.tickSpacing) * input.tickSpacing;
  const tickLower = clamp(
    Math.floor(rawLower / input.tickSpacing) * input.tickSpacing,
    minimumUsable,
    maximumUsable,
  );
  const tickUpper = clamp(
    Math.ceil(rawUpper / input.tickSpacing) * input.tickSpacing,
    minimumUsable,
    maximumUsable,
  );

  if (tickLower >= tickUpper) {
    throw new Error("snapped range is empty; increase width or verify tick spacing");
  }

  return {
    orientation: "token1 per token0",
    tickCurrent: floorTick(input.price, decimals0, decimals1),
    tickLower,
    tickUpper,
    requestedPriceLower,
    requestedPriceUpper,
    snappedPriceLower: tickToPrice(tickLower, decimals0, decimals1),
    snappedPriceUpper: tickToPrice(tickUpper, decimals0, decimals1),
  };
}

export function evaluatePosition(input: PositionInput): PositionResult {
  integer(input.tickCurrent, "tickCurrent");
  integer(input.tickLower, "tickLower");
  integer(input.tickUpper, "tickUpper");
  const edgeBufferTicks = input.edgeBufferTicks ?? 0;
  integer(edgeBufferTicks, "edgeBufferTicks");
  if (input.tickLower >= input.tickUpper) throw new Error("tickLower must be below tickUpper");
  if (edgeBufferTicks < 0) throw new Error("edgeBufferTicks must be at least 0");

  const inRange = input.tickCurrent >= input.tickLower && input.tickCurrent < input.tickUpper;
  const state = input.tickCurrent < input.tickLower
    ? "below-range"
    : input.tickCurrent >= input.tickUpper
      ? "above-range"
      : "in-range";
  const distanceToLower = input.tickCurrent - input.tickLower;
  const distanceToUpper = input.tickUpper - input.tickCurrent;

  return {
    state,
    inRange,
    nearEdge: inRange && Math.min(distanceToLower, distanceToUpper) <= edgeBufferTicks,
    percentThroughRange: inRange
      ? ((input.tickCurrent - input.tickLower) / (input.tickUpper - input.tickLower)) * 100
      : null,
    distanceToLower,
    distanceToUpper,
  };
}

export function evaluateEconomics(input: EconomicsInput): EconomicsResult {
  finite(input.capitalUsd, "capitalUsd");
  finite(input.days, "days");
  nonNegative(input.feesUsd, "feesUsd");
  const incentivesUsd = input.incentivesUsd ?? 0;
  const costsUsd = input.costsUsd ?? 0;
  nonNegative(incentivesUsd, "incentivesUsd");
  nonNegative(costsUsd, "costsUsd");
  if (input.capitalUsd <= 0) throw new Error("capitalUsd must be greater than 0");
  if (input.days <= 0) throw new Error("days must be greater than 0");

  const grossIncomeUsd = input.feesUsd + incentivesUsd;
  const netIncomeUsd = grossIncomeUsd - costsUsd;
  const annualFactor = 365 / input.days;

  return {
    grossIncomeUsd,
    netIncomeUsd,
    periodReturnPercent: (netIncomeUsd / input.capitalUsd) * 100,
    feeAprPercent: (input.feesUsd / input.capitalUsd) * annualFactor * 100,
    incentiveAprPercent: (incentivesUsd / input.capitalUsd) * annualFactor * 100,
    netSimpleAprPercent: (netIncomeUsd / input.capitalUsd) * annualFactor * 100,
    costCoverageRatio: costsUsd === 0 ? null : grossIncomeUsd / costsUsd,
  };
}
