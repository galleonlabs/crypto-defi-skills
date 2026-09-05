# Repository consolidation

LP and Hyperliquid skill development now lives in this monorepo. Their complete source histories were imported under `packages/lp` and `packages/hyperliquid` on 2026-09-05.

| Previous repository | New source | npm and CLI |
| --- | --- | --- |
| `galleonlabs/lp-skills` | `packages/lp` | `galleon-lp-skills`, `lp-skills` |
| `galleonlabs/hyperliquid-skills` | `packages/hyperliquid` | `galleon-hyperliquid-skills`, `hl-skills`, `hyperliquid-skills` |

The previous repositories are retired. Replace saved Git URLs with the package URLs in the [installation guide](README.md#install-only-what-you-need). Existing npm package names and published versions remain valid; no package unpublishing is involved. Original tags are preserved here with `legacy-lp/` and `legacy-hyperliquid/` prefixes.

The imported LP head was `797110d392cd2de7bb0dabcf1046b1c0ae03a143`; Hyperliquid was `894cf1f1681fa74191cb0b161a41655ff23341d2`. Both repositories had no issues, pull requests, forks, or stars at migration inspection. Historic release archives are preserved in the migration archive release on this repository.

[Boomkin](https://github.com/galleonlabs/boomkin) pins each pack to a monorepo revision and package subdirectory. Users can select packs independently, and updates preserve their selection. See [Boomkin's update guide](https://github.com/galleonlabs/boomkin/blob/main/docs/UPDATES.md) for the current update workflow.
