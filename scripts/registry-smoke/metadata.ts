export interface RegistryIdentity {
  name: string;
  version: string;
  repository: { directory: string; url: string };
}

export interface RegistryMetadata extends RegistryIdentity {
  dist: { integrity: string };
}

const object = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

/** npm 12 may wrap an exact-version response in a singleton array. */
export function registryMetadata(input: unknown, expected: RegistryIdentity): RegistryMetadata {
  const candidate = Array.isArray(input) && input.length === 1 ? input[0] : input;
  if (
    !object(candidate) ||
    candidate.name !== expected.name ||
    candidate.version !== expected.version ||
    !object(candidate.repository) ||
    candidate.repository.directory !== expected.repository.directory ||
    candidate.repository.url !== expected.repository.url ||
    !object(candidate.dist) ||
    typeof candidate.dist.integrity !== "string" ||
    candidate.dist.integrity.length === 0
  ) {
    throw new Error(`Registry identity mismatch: ${expected.name}@${expected.version}`);
  }
  return candidate as unknown as RegistryMetadata;
}
