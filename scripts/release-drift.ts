import { packages, root } from "./workspaces.ts";
import { formatReport, inspectPacks } from "./release-drift/drift.ts";

const json = process.argv.includes("--json");
const report = inspectPacks(root, (await packages()).map((pack) => ({
  id: pack.id,
  directory: pack.directory,
  name: pack.manifest.name,
  version: pack.manifest.version,
})));
process.stdout.write(json ? `${JSON.stringify(report, null, 2)}\n` : formatReport(report));
if (report.drift > 0) process.exitCode = 1;
