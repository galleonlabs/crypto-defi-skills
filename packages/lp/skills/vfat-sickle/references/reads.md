# Read recipes and sources

Reviewed 2026-10-25. These recipes establish documented interfaces, not a live account or executed outcome.

Read-only entry points: `https://vfat.io/yield` for farms and the user's public portfolio view. Official source docs describe Sickle strategy batching and fee bases.

Resolve current contracts through those sources, then use verified ABIs over the user's configured RPC. Record chain, Sickle, owner, LP/farm identities, strategy and registry-approved targets. Public page data and a verified ABI supply read evidence; they do not supply an official transaction API.

For a route with principal P and rewards R, compute each fee against the documented base separately. Preserve raw token amounts and prices before comparing values. If the UI cannot expose the exact route or fee recipient, an unsigned action remains incomplete rather than assuming zero cost.

## Primary sources

- [VFAT Sickle ownership and strategies](https://github.com/vfat-io/vfat-docs/blob/main/sickle.md)
- [VFAT fee bases](https://github.com/vfat-io/vfat-docs/blob/main/fees.md)
- [VFAT APR definitions](https://github.com/vfat-io/vfat-docs/blob/main/aprs.md)
