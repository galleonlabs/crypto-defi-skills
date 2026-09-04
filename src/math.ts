export type PositionSide = "long" | "short";

export interface RiskSizingInput {
  side: PositionSide;
  equityUsd: number;
  riskPercent: number;
  entryPrice: number;
  stopPrice: number;
  stopSlippageBps: number;
  entryFeeBps: number;
  exitFeeBps: number;
  sizeDecimals: number;
  leverage?: number;
}

export interface RiskSizingResult {
  side: PositionSide;
  riskBudgetUsd: number;
  nominalStopDistance: number;
  stressedStopFill: number;
  slippagePerUnit: number;
  feesPerUnit: number;
  stressedDistance: number;
  rawSize: number;
  size: number;
  entryNotionalUsd: number;
  nominalRiskUsd: number;
  stressedRiskUsd: number;
  unusedRiskBudgetUsd: number;
  marginUsd: number | null;
}

export interface FundingInput {
  side: PositionSide;
  notionalUsd: number;
  rate: number;
  intervalHours: number;
  hours: number;
}

export interface FundingResult {
  side: PositionSide;
  ratePerHour: number;
  ratePerHourPercent: number;
  simpleAnnualRatePercent: number;
  periods: number;
  accountCashflowUsd: number;
}

export interface LiquidationInput {
  side: PositionSide;
  markPrice: number;
  liquidationPrice: number;
}

export interface LiquidationResult {
  side: PositionSide;
  markPrice: number;
  liquidationPrice: number;
  priceDistance: number;
  bufferPercent: number;
  bufferBps: number;
}

export interface ReviewInput {
  side: PositionSide;
  size: number;
  entryPrice: number;
  exitPrice: number;
  entryFeeUsd: number;
  exitFeeUsd: number;
  fundingUsd: number;
  riskUsd?: number;
}

export interface ReviewResult {
  side: PositionSide;
  grossPnlUsd: number;
  feesUsd: number;
  fundingUsd: number;
  netPnlUsd: number;
  netCostUsd: number;
  returnOnEntryNotionalPercent: number;
  rMultiple: number | null;
}

function finite(value: number, field: string): void {
  if (!Number.isFinite(value)) throw new Error(`${field} must be finite`);
}

function positive(value: number, field: string): void {
  finite(value, field);
  if (value <= 0) throw new Error(`${field} must be greater than 0`);
}

function nonNegative(value: number, field: string): void {
  finite(value, field);
  if (value < 0) throw new Error(`${field} must be at least 0`);
}

function assertSide(side: string): asserts side is PositionSide {
  if (side !== "long" && side !== "short") throw new Error("side must be long or short");
}

export function roundDown(value: number, decimals: number): number {
  nonNegative(value, "value");
  finite(decimals, "decimals");
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 18) {
    throw new Error("decimals must be an integer between 0 and 18");
  }
  const factor = 10 ** decimals;
  return Math.floor((value + Number.EPSILON) * factor) / factor;
}

export function sizeRisk(input: RiskSizingInput): RiskSizingResult {
  assertSide(input.side);
  positive(input.equityUsd, "equityUsd");
  positive(input.riskPercent, "riskPercent");
  if (input.riskPercent > 100) throw new Error("riskPercent must be at most 100");
  positive(input.entryPrice, "entryPrice");
  positive(input.stopPrice, "stopPrice");
  nonNegative(input.stopSlippageBps, "stopSlippageBps");
  nonNegative(input.entryFeeBps, "entryFeeBps");
  nonNegative(input.exitFeeBps, "exitFeeBps");
  if (!Number.isInteger(input.sizeDecimals) || input.sizeDecimals < 0 || input.sizeDecimals > 18) {
    throw new Error("sizeDecimals must be an integer between 0 and 18");
  }
  if (input.side === "long" && input.stopPrice >= input.entryPrice) {
    throw new Error("a long stop must be below entry");
  }
  if (input.side === "short" && input.stopPrice <= input.entryPrice) {
    throw new Error("a short stop must be above entry");
  }
  if (input.leverage !== undefined) positive(input.leverage, "leverage");

  const riskBudgetUsd = input.equityUsd * input.riskPercent / 100;
  const nominalStopDistance = Math.abs(input.entryPrice - input.stopPrice);
  const slippagePerUnit = input.entryPrice * input.stopSlippageBps / 10_000;
  const stressedStopFill = input.side === "long"
    ? input.stopPrice - slippagePerUnit
    : input.stopPrice + slippagePerUnit;
  if (stressedStopFill <= 0) throw new Error("stressed stop fill must stay above 0");
  const feesPerUnit = input.entryPrice * input.entryFeeBps / 10_000
    + stressedStopFill * input.exitFeeBps / 10_000;
  const stressedDistance = Math.abs(input.entryPrice - stressedStopFill) + feesPerUnit;
  const rawSize = riskBudgetUsd / stressedDistance;
  const size = roundDown(rawSize, input.sizeDecimals);
  const entryNotionalUsd = size * input.entryPrice;
  const nominalRiskUsd = size * nominalStopDistance;
  const stressedRiskUsd = size * stressedDistance;

  return {
    side: input.side,
    riskBudgetUsd,
    nominalStopDistance,
    stressedStopFill,
    slippagePerUnit,
    feesPerUnit,
    stressedDistance,
    rawSize,
    size,
    entryNotionalUsd,
    nominalRiskUsd,
    stressedRiskUsd,
    unusedRiskBudgetUsd: riskBudgetUsd - stressedRiskUsd,
    marginUsd: input.leverage === undefined ? null : entryNotionalUsd / input.leverage,
  };
}

export function normalizeFunding(input: FundingInput): FundingResult {
  assertSide(input.side);
  positive(input.notionalUsd, "notionalUsd");
  finite(input.rate, "rate");
  positive(input.intervalHours, "intervalHours");
  positive(input.hours, "hours");
  const ratePerHour = input.rate / input.intervalHours;
  const periods = input.hours / input.intervalHours;
  const payerSign = input.side === "long" ? -1 : 1;
  return {
    side: input.side,
    ratePerHour,
    ratePerHourPercent: ratePerHour * 100,
    simpleAnnualRatePercent: ratePerHour * 24 * 365 * 100,
    periods,
    accountCashflowUsd: payerSign * input.notionalUsd * ratePerHour * input.hours,
  };
}

export function liquidationDistance(input: LiquidationInput): LiquidationResult {
  assertSide(input.side);
  positive(input.markPrice, "markPrice");
  positive(input.liquidationPrice, "liquidationPrice");
  const priceDistance = input.side === "long"
    ? input.markPrice - input.liquidationPrice
    : input.liquidationPrice - input.markPrice;
  return {
    side: input.side,
    markPrice: input.markPrice,
    liquidationPrice: input.liquidationPrice,
    priceDistance,
    bufferPercent: priceDistance / input.markPrice * 100,
    bufferBps: priceDistance / input.markPrice * 10_000,
  };
}

export function reviewTrade(input: ReviewInput): ReviewResult {
  assertSide(input.side);
  positive(input.size, "size");
  positive(input.entryPrice, "entryPrice");
  positive(input.exitPrice, "exitPrice");
  nonNegative(input.entryFeeUsd, "entryFeeUsd");
  nonNegative(input.exitFeeUsd, "exitFeeUsd");
  finite(input.fundingUsd, "fundingUsd");
  if (input.riskUsd !== undefined) positive(input.riskUsd, "riskUsd");
  const direction = input.side === "long" ? 1 : -1;
  const grossPnlUsd = direction * (input.exitPrice - input.entryPrice) * input.size;
  const feesUsd = input.entryFeeUsd + input.exitFeeUsd;
  const netCostUsd = feesUsd - input.fundingUsd;
  const netPnlUsd = grossPnlUsd - netCostUsd;
  return {
    side: input.side,
    grossPnlUsd,
    feesUsd,
    fundingUsd: input.fundingUsd,
    netPnlUsd,
    netCostUsd,
    returnOnEntryNotionalPercent: netPnlUsd / (input.entryPrice * input.size) * 100,
    rMultiple: input.riskUsd === undefined ? null : netPnlUsd / input.riskUsd,
  };
}
