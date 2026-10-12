// Copyright (c) Galleon Labs. MIT License.
// Offline arithmetic over supplied observations. No RPC, signing or execution.
import { readFileSync, realpathSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const UINT256_MAX = (1n << 256n) - 1n;
const ADDRESS = /^0x[0-9a-fA-F]{40}$/;
const HASH = /^0x[0-9a-fA-F]{64}$/;
const SNAPSHOT_FIELDS = ['chainId', 'vault', 'asset', 'shareToken', 'owner', 'controller', 'receiver', 'caller', 'blockNumber', 'blockHash', 'assetDecimals', 'shareDecimals'];

class InputError extends Error {
  constructor(field) { super(`Invalid field: ${field}`); }
}

function fail(field) { throw new InputError(field); }
function object(value, field, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(field);
  if (Object.keys(value).some((key) => !keys.includes(key))) fail(field);
}
function raw(value, field, positive = false) {
  if (typeof value !== 'string' || value.length > 78 || !/^(0|[1-9][0-9]*)$/.test(value)) fail(field);
  const number = BigInt(value);
  if (number > UINT256_MAX || (positive && number === 0n)) fail(field);
  return number;
}
function hash(value, field) {
  if (typeof value !== 'string' || !HASH.test(value)) fail(field);
}
function member(value, values, field) { if (!values.includes(value)) fail(field); }

function validate(input) {
  object(input, 'input', ['schemaVersion', 'snapshot', 'mode', 'intent', 'reads', 'preview', 'requests']);
  if (input.schemaVersion !== 1) fail('schemaVersion');
  const snapshot = input.snapshot;
  object(snapshot, 'snapshot', SNAPSHOT_FIELDS);
  raw(snapshot.chainId, 'snapshot.chainId', true);
  raw(snapshot.blockNumber, 'snapshot.blockNumber');
  hash(snapshot.blockHash, 'snapshot.blockHash');
  for (const key of ['vault', 'asset', 'shareToken', 'owner', 'controller', 'receiver', 'caller']) {
    if (typeof snapshot[key] !== 'string' || !ADDRESS.test(snapshot[key])) fail(`snapshot.${key}`);
  }
  for (const key of ['assetDecimals', 'shareDecimals']) {
    if (!Number.isInteger(snapshot[key]) || snapshot[key] < 0 || snapshot[key] > 255) fail(`snapshot.${key}`);
  }
  member(input.mode, ['erc4626', 'erc7540', 'unknown'], 'mode');
  object(input.intent, 'intent', ['unit', 'amountRaw']);
  member(input.intent.unit, ['assets', 'shares'], 'intent.unit');
  raw(input.intent.amountRaw, 'intent.amountRaw', true);
  object(input.reads, 'reads', ['shareBalance', 'maxWithdraw', 'maxRedeem']);
  for (const key of ['shareBalance', 'maxWithdraw', 'maxRedeem']) {
    const read = input.reads[key];
    if (read === null) continue;
    object(read, `reads.${key}`, ['raw', 'blockHash']);
    raw(read.raw, `reads.${key}.raw`);
    hash(read.blockHash, `reads.${key}.blockHash`);
  }
  if (input.preview != null) {
    object(input.preview, 'preview', ['method', 'amountRaw', 'resultRaw', 'blockHash']);
    member(input.preview.method, ['previewWithdraw', 'previewRedeem'], 'preview.method');
    raw(input.preview.amountRaw, 'preview.amountRaw', true);
    raw(input.preview.resultRaw, 'preview.resultRaw');
    hash(input.preview.blockHash, 'preview.blockHash');
  }
  if (input.requests != null) {
    object(input.requests, 'requests', ['coverage', 'items']);
    member(input.requests.coverage, ['complete', 'partial', 'unknown'], 'requests.coverage');
    if (!Array.isArray(input.requests.items) || input.requests.items.length > 10000) fail('requests.items');
    for (const [index, request] of input.requests.items.entries()) {
      const field = `requests.items[${index}]`;
      object(request, field, ['requestId', 'pendingSharesRaw', 'claimableSharesRaw', 'blockHash']);
      raw(request.requestId, `${field}.requestId`);
      hash(request.blockHash, `${field}.blockHash`);
      for (const key of ['pendingSharesRaw', 'claimableSharesRaw']) {
        if (request[key] !== null) raw(request[key], `${field}.${key}`);
      }
    }
  }
}

function summarizeRequests(input) {
  const requests = input.requests ?? { coverage: 'unknown', items: [] };
  const items = requests.items.map((item) => ({ ...item }));
  const sum = (key) => {
    if ((!items.length && requests.coverage !== 'complete') || items.some((item) => item[key] === null)) return null;
    return items.reduce((total, item) => total + BigInt(item[key]), 0n).toString();
  };
  return {
    coverage: requests.coverage,
    idMode: !items.length ? 'none' : items.some((item) => item.requestId === '0') ? 'aggregate' : 'individual',
    totalsScope: 'listed-requests-only',
    walletSharesRaw: input.reads.shareBalance?.raw ?? null,
    pendingSharesRaw: sum('pendingSharesRaw'),
    claimableSharesRaw: sum('claimableSharesRaw'),
    items,
    interpretation: 'request-state-only;zero-does-not-prove-claimed',
  };
}

/** Assess only the supplied historical block; this does not verify its provenance. */
export function assessExit(input) {
  validate(input);
  const { snapshot, intent, reads, mode, preview } = input;
  const unit = intent.unit;
  const result = {
    schemaVersion: 1,
    snapshot: { ...snapshot },
    mode,
    evidence: {
      scope: 'supplied-only-historical-block',
      issues: [],
      requirements: ['fresh-deployed-contract-reads', 'caller-and-role-verification', 'exact-candidate-simulation', 'explicit-execution-authority', 'receipt-and-balance-reconciliation'],
    },
    status: 'needs-evidence',
    requested: { ...intent },
    available: { unit, amountRaw: null },
    remaining: { unit, amountRaw: null },
    candidate: null,
    asyncRequests: mode === 'erc7540' ? summarizeRequests(input) : null,
    nextRead: ['refresh-same-block-identity-and-limits', 'verify-deployed-contract-and-caller-roles'],
  };
  const issues = result.evidence.issues;
  let inconsistent = false;
  const conflict = (reason) => { issues.push(reason); inconsistent = true; };
  const sameBlock = (value) => value.blockHash.toLowerCase() === snapshot.blockHash.toLowerCase();
  for (const key of ['shareBalance', 'maxWithdraw', 'maxRedeem']) {
    if (reads[key] && !sameBlock(reads[key])) conflict(`reads.${key}:block-mismatch`);
  }
  if (preview && !sameBlock(preview)) conflict('preview:block-mismatch');
  if (input.requests) {
    const ids = new Set();
    for (const request of input.requests.items) {
      if (!sameBlock(request)) conflict('requests:block-mismatch');
      if (ids.has(request.requestId)) conflict('requests:duplicate-request-id');
      ids.add(request.requestId);
    }
    if (ids.has('0') && ids.size > 1) conflict('requests:mixed-aggregate-and-individual-ids');
    if (mode === 'erc4626') conflict('requests:async-evidence-with-sync-mode');
  }
  if (mode === 'erc7540') {
    if (preview) conflict('preview:async-redeem-previews-must-revert');
    const requests = result.asyncRequests;
    result.nextRead.push('reconcile-controller-request-inventory-before-any-new-request', 'read-claim-conversion-and-timing-from-deployed-contract');
    if (requests.coverage !== 'complete') issues.push('requests:inventory-incomplete');
    if (requests.pendingSharesRaw === null || requests.claimableSharesRaw === null) issues.push('requests:state-unknown');
    // Limits are controller-wide, never attributed to the supplied subset of IDs.
    if (requests.coverage === 'complete' && requests.claimableSharesRaw !== null && reads.maxRedeem &&
        BigInt(reads.maxRedeem.raw) > BigInt(requests.claimableSharesRaw)) {
      conflict('reads.maxRedeem:exceeds-complete-claimable-shares');
    }
    if (requests.coverage === 'complete' && requests.claimableSharesRaw === '0' && reads.maxWithdraw &&
        BigInt(reads.maxWithdraw.raw) > 0n) {
      conflict('reads.maxWithdraw:positive-with-no-complete-claimable-shares');
    }
  }
  if (mode === 'erc4626' && reads.maxRedeem && reads.shareBalance &&
      BigInt(reads.maxRedeem.raw) > BigInt(reads.shareBalance.raw)) {
    conflict('reads.maxRedeem:exceeds-share-balance');
  }
  if (inconsistent) {
    result.status = 'inconsistent-evidence';
    if (result.asyncRequests) {
      result.asyncRequests.pendingSharesRaw = null;
      result.asyncRequests.claimableSharesRaw = null;
      issues.push('requests:totals-unusable');
    }
    result.nextRead.push('replace-conflicting-evidence-at-one-block');
    return result;
  }
  if (mode === 'unknown') {
    issues.push('mode:exit-mechanism-unverified');
    result.nextRead.push('identify-deployed-exit-mechanism');
    return result;
  }
  const required = mode === 'erc4626' ? ['shareBalance', 'maxWithdraw', 'maxRedeem'] : [unit === 'assets' ? 'maxWithdraw' : 'maxRedeem'];
  const missing = required.filter((key) => reads[key] === null);
  if (missing.length) {
    for (const key of missing) issues.push(`reads.${key}:missing`);
    result.nextRead.push('read-missing-limits-with-explicit-owner-or-controller');
    return result;
  }
  const limit = BigInt(reads[unit === 'assets' ? 'maxWithdraw' : 'maxRedeem'].raw);
  const requested = BigInt(intent.amountRaw);
  const available = requested < limit ? requested : limit;
  result.available.amountRaw = available.toString();
  result.remaining.amountRaw = (requested - available).toString();
  result.status = available === 0n ? 'observed-zero-limit' : available < requested ? 'observed-partial-limit' : 'observed-full-limit';
  if (available === 0n) {
    result.nextRead.push(mode === 'erc7540' ? 'inspect-existing-request-state-and-claim-limits' : 'inspect-limit-reason-and-refresh');
    return result;
  }
  const method = unit === 'assets' ? 'withdraw' : 'redeem';
  const accountRole = mode === 'erc7540' ? 'controller' : 'owner';
  result.candidate = {
    method,
    amountRaw: available.toString(),
    unit,
    accountRole,
    account: snapshot[accountRole],
    receiver: snapshot.receiver,
    previewEstimate: null,
  };
  if (preview && mode === 'erc4626') {
    const expectedMethod = method === 'withdraw' ? 'previewWithdraw' : 'previewRedeem';
    if (preview.method !== expectedMethod || BigInt(preview.amountRaw) !== available) {
      issues.push('preview:not-exact-candidate');
      result.nextRead.push('read-preview-for-exact-candidate-amount');
    } else if (method === 'withdraw' && BigInt(preview.resultRaw) > BigInt(reads.shareBalance.raw)) {
      issues.push('preview:required-shares-exceed-balance');
      result.status = 'inconsistent-evidence';
      result.available.amountRaw = null;
      result.remaining.amountRaw = null;
      result.candidate = null;
      result.nextRead.push('replace-conflicting-evidence-at-one-block');
    } else {
      result.candidate.previewEstimate = {
        method: preview.method,
        unit: method === 'withdraw' ? 'shares' : 'assets',
        amountRaw: preview.resultRaw,
        meaning: method === 'withdraw' ? 'shares-required' : 'assets-returned',
      };
    }
  } else if (mode === 'erc4626') {
    result.nextRead.push('read-preview-for-exact-candidate-amount');
  }
  return result;
}

function main(args) {
  if (args.length === 1 && args[0] === '--help') {
    console.log('Usage: node scripts/assess-exit.mjs <snapshot.json>\n       node scripts/assess-exit.mjs - < snapshot.json\nOffline schemaVersion 1 exit evidence. See references/assessment.md and examples/.\nHistorical observations only. Does not verify provenance, authorize, sign or execute.');
    return;
  }
  if (args.length !== 1 || (args[0].startsWith('-') && args[0] !== '-')) {
    console.error('Invalid arguments; use --help');
    process.exitCode = 1;
    return;
  }
  let source;
  try { source = readFileSync(args[0] === '-' ? 0 : args[0], 'utf8'); }
  catch { console.error('Unable to read input'); process.exitCode = 1; return; }
  let input;
  try { input = JSON.parse(source); }
  catch { console.error('Invalid JSON input'); process.exitCode = 1; return; }
  try { console.log(JSON.stringify(assessExit(input), null, 2)); }
  catch (error) {
    console.error(error instanceof InputError ? error.message : 'Unable to assess input');
    process.exitCode = 1;
  }
}

// Safe when imported from node --input-type=module (which has no argv[1]).
function isMain() {
  if (!process.argv[1]) return false;
  try { return import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href; }
  catch { return false; }
}
if (isMain()) main(process.argv.slice(2));
