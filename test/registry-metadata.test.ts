import { expect, test } from "bun:test";
import { registryMetadata } from "../scripts/registry-smoke/metadata.ts";

const expected = {
  name: "galleon-defi-strategy-skills",
  version: "0.1.0",
  repository: { directory: "packages/strategy", url: "git+https://github.com/galleonlabs/crypto-defi-skills.git" },
};
const release = () => ({ ...expected, repository: { ...expected.repository }, dist: { integrity: "sha512-public-artifact-integrity" } });

test("accepts exact registry metadata as an object or npm 12 singleton array", () => {
  const metadata = release();
  expect(registryMetadata(metadata, expected)).toEqual(metadata);
  expect(registryMetadata([metadata], expected)).toEqual(metadata);
});

test("rejects empty, multiple-version, nested and nonobject registry responses", () => {
  for (const metadata of [[], [release(), { ...release(), version: "0.2.0" }], [release(), release()], [null], [[]], ["0.1.0"], null, "0.1.0", 1, true]) {
    expect(() => registryMetadata(metadata, expected)).toThrow("Registry identity mismatch: galleon-defi-strategy-skills@0.1.0");
  }
});

test("a singleton wrapper does not bypass exact name, version or repository checks", () => {
  for (const metadata of [
    { ...release(), name: "another-package" },
    { ...release(), version: "0.2.0" },
    { ...release(), repository: { ...expected.repository, directory: "packages/data" } },
    { ...release(), repository: { ...expected.repository, url: "git+https://example.com/another-repo.git" } },
    { ...release(), repository: null },
  ]) {
    expect(() => registryMetadata(metadata, expected)).toThrow();
    expect(() => registryMetadata([metadata], expected)).toThrow();
  }
});

test("rejects missing or nonstring integrity before installing the release", () => {
  for (const dist of [undefined, {}, { integrity: "" }, { integrity: true }, { integrity: null }, []]) {
    expect(() => registryMetadata([{ ...release(), dist }], expected)).toThrow();
  }
});
