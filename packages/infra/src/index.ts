export { diagnoseRpc, credentialPresence, type ReadinessInput, type ReadinessReport, type Transport } from "../skills/galleon-defi-infra/scripts/readiness.js";
export const SKILL_CATALOG = [{ name: "galleon-defi-infra", purpose: "Wire RPC, managed wallets and Hermes; verify read access and scoped permissions." }] as const;
