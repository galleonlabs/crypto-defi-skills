#!/usr/bin/env node

const MIN_TICK = -887272;
const MAX_TICK = 887272;
const LN_1_0001 = Math.log(1.0001);
const LN_10 = Math.log(10);

function floatRatio(value) {
  const bytes = new ArrayBuffer(8);
  const floatBits = new Float64Array(bytes);
  const intBits = new BigUint64Array(bytes);
  floatBits[0] = value;
  const bits = intBits[0];
  const exponent = Number((bits >> 52n) & 0x7ffn);
  const fraction = bits & ((1n << 52n) - 1n);
  if (exponent === 0) return { num: fraction, den: 1n << 1074n };
  const mantissa = fraction | (1n << 52n);
  const power = exponent - 1023 - 52;
  if (power >= 0) return { num: mantissa << BigInt(power), den: 1n };
  return { num: mantissa, den: 1n << BigInt(-power) };
}

// 1.0001^|tick| as an exact ratio has millions of digits near the protocol
// bounds, so the comparison uses a 256-bit fixed-point bracket instead: `low`
// only rounds down and `high` only rounds up, which keeps the true power
// between them. A double is never close enough to a tick boundary for the
// bracket to straddle it; if it ever did, the answer is undefined and the
// float tick is kept.
const POWER_BITS = 256n;
const POWER_ONE = 1n << POWER_BITS;

function powerBracket(exponent) {
  let low = POWER_ONE;
  let high = POWER_ONE;
  let baseLow = (POWER_ONE * 10001n) / 10000n;
  let baseHigh = baseLow + 1n;
  for (let remaining = exponent; remaining > 0; remaining = Math.floor(remaining / 2)) {
    if (remaining % 2 === 1) {
      low = (low * baseLow) >> POWER_BITS;
      high = ((high * baseHigh) >> POWER_BITS) + 1n;
    }
    baseLow = (baseLow * baseLow) >> POWER_BITS;
    baseHigh = ((baseHigh * baseHigh) >> POWER_BITS) + 1n;
  }
  return { low, high };
}

// True when 1.0001^tick <= num / den.
function priceReachedTick(num, den, tick) {
  const { low, high } = powerBracket(Math.abs(tick));
  const price = num * POWER_ONE;
  if (tick >= 0) {
    if (high * den <= price) return true;
    if (low * den > price) return false;
    return undefined;
  }
  // 1.0001^tick is 1 / 1.0001^|tick|, so compare den <= num * 1.0001^|tick|.
  const scaledDen = den * POWER_ONE;
  if (num * low >= scaledDen) return true;
  if (num * high < scaledDen) return false;
  return undefined;
}

// Stay aligned with src/math.ts.
function floorTick(price, decimals0, decimals1) {
  const raw = (Math.log(price) + (decimals1 - decimals0) * LN_10) / LN_1_0001;
  let tick = Math.min(MAX_TICK, Math.max(MIN_TICK, Math.floor(raw)));
  const ratio = floatRatio(price);
  const scale = decimals1 - decimals0;
  const num = scale >= 0 ? ratio.num * 10n ** BigInt(scale) : ratio.num;
  const den = scale >= 0 ? ratio.den : ratio.den * 10n ** BigInt(-scale);
  // Math.log can miss floor(ln(price) / ln(1.0001)) by one tick.
  if (tick < MAX_TICK && priceReachedTick(num, den, tick + 1) === true) tick += 1;
  else if (tick > MIN_TICK && priceReachedTick(num, den, tick) === false) tick -= 1;
  return tick;
}

function parse(args) {
  const flags = new Map();
  for (let index = 0; index < args.length; index += 1) {
    const key = args[index];
    if (!key?.startsWith("--")) throw new Error(`unexpected argument: ${key}`);
    if (key === "--help") return new Map([["help", true]]);
    const value = args[index + 1];
    if (value === undefined || value.startsWith("--")) throw new Error(`${key} requires a value`);
    flags.set(key.slice(2), value);
    index += 1;
  }
  return flags;
}

function readNumber(flags, key, fallback) {
  const raw = flags.get(key);
  if (raw === undefined && fallback !== undefined) return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value)) throw new Error(`--${key} must be a finite number`);
  return value;
}

function main() {
  const flags = parse(process.argv.slice(2));
  if (flags.has("help")) {
    process.stdout.write("Usage: node scripts/range.mjs --price <token1-per-token0> --width <percent-per-side> --tick-spacing <integer> [--decimals0 <integer>] [--decimals1 <integer>]\n");
    return;
  }
  const allowed = new Set(["price", "width", "tick-spacing", "decimals0", "decimals1"]);
  for (const key of flags.keys()) if (!allowed.has(key)) throw new Error(`unknown option: --${key}`);
  const price = readNumber(flags, "price");
  const width = readNumber(flags, "width");
  const spacing = readNumber(flags, "tick-spacing");
  const decimals0 = readNumber(flags, "decimals0", 18);
  const decimals1 = readNumber(flags, "decimals1", 18);
  if (price <= 0) throw new Error("price must be greater than 0");
  if (width <= 0 || width >= 100) throw new Error("width must be greater than 0 and less than 100");
  if (!Number.isInteger(spacing) || spacing <= 0) throw new Error("tick-spacing must be a positive integer");
  if (![decimals0, decimals1].every((value) => Number.isInteger(value) && value >= 0 && value <= 36)) {
    throw new Error("decimals must be integers between 0 and 36");
  }
  const toTick = (humanPrice) => (Math.log(humanPrice) + (decimals1 - decimals0) * LN_10) / LN_1_0001;
  const toPrice = (tick) => Math.exp(tick * LN_1_0001 + (decimals0 - decimals1) * LN_10);
  const rawCurrent = toTick(price);
  const rawLower = toTick(price * (1 - width / 100));
  const rawUpper = toTick(price * (1 + width / 100));
  if (rawCurrent < MIN_TICK || rawCurrent > MAX_TICK) throw new Error("price is outside supported tick bounds");
  if (rawLower < MIN_TICK || rawUpper > MAX_TICK) throw new Error("requested price interval exceeds supported tick bounds");
  const minimum = Math.ceil(MIN_TICK / spacing) * spacing;
  const maximum = Math.floor(MAX_TICK / spacing) * spacing;
  const clamp = (value) => Math.min(maximum, Math.max(minimum, value));
  const requestedLower = price * (1 - width / 100);
  const requestedUpper = price * (1 + width / 100);
  const tickLower = clamp(Math.floor(rawLower / spacing) * spacing);
  const tickUpper = clamp(Math.ceil(rawUpper / spacing) * spacing);
  if (tickLower >= tickUpper) throw new Error("snapped range is empty; increase width or verify tick spacing");
  process.stdout.write(`${JSON.stringify({
    ok: true,
    orientation: "token1 per token0",
    tickCurrent: floorTick(price, decimals0, decimals1),
    tickLower,
    tickUpper,
    requestedPriceLower: requestedLower,
    requestedPriceUpper: requestedUpper,
    snappedPriceLower: toPrice(tickLower),
    snappedPriceUpper: toPrice(tickUpper),
  }, null, 2)}\n`);
}

try {
  main();
} catch (error) {
  process.stdout.write(`${JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) })}\n`);
  process.exitCode = 1;
}
