#!/usr/bin/env node
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runCli } from "../../../scripts/content-pack/cli.ts";
import { SKILL_CATALOG } from "./catalog.js";
await runCli(resolve(dirname(fileURLToPath(import.meta.url)), ".."), SKILL_CATALOG);
