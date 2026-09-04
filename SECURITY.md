# Security policy

Report vulnerabilities through [GitHub private vulnerability reporting](https://github.com/galleonlabs/hyperliquid-skills/security/advisories/new).

Do not open a public issue for private-key exposure, signature flaws, replay risk, incorrect asset resolution, unsafe retries, authorization bypass, or transaction-state errors.

This repository contains no signing implementation and no networked execution code. Its execution skill requires a trusted external signer and explicit user authorization. A bug in instructions can still cause financial loss, so include the affected skill, a minimal reproduction, and the safest known containment step.

Supported versions: the latest release only.
