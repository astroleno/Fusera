import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

export type ArtifactEnvelope = {
  artifact_type: string;
  schema_version: string;
  artifact_id: string;
  run_id: string;
  status: "draft" | "validated" | "rejected" | "superseded";
  producer_stage: string;
  input_refs: string[];
  validation: {
    valid: boolean;
    errors: string[];
  };
  payload: Record<string, unknown>;
};

export type ArtifactValidationResult = {
  valid: boolean;
  errors: string[];
  artifact: ArtifactEnvelope;
  persisted_path?: string;
};

export const ARTIFACT_FILE_NAMES: Record<string, string> = {
  ProductBrief: "product-brief.json",
  BrandProfile: "brand-profile.json",
  PagePlan: "page-plan.json",
  SectionGraph: "section-graph.json",
  ThemeTokens: "theme-tokens.json",
  DesignSpec: "design-spec.json",
  PageSpec: "page-spec.json",
  QAReport: "qa-report.json",
  PublishVersion: "publish-version.json"
};

export const SCHEMA_FILE_NAMES: Record<string, string> = {
  ProductBrief: "product-brief.schema.json",
  BrandProfile: "brand-profile.schema.json",
  PagePlan: "page-plan.schema.json",
  SectionGraph: "section-graph.schema.json",
  ThemeTokens: "theme-tokens.schema.json",
  DesignSpec: "design-spec.schema.json",
  PageSpec: "page-spec.schema.json",
  QAReport: "qa-report.schema.json",
  PublishVersion: "publish-version.schema.json"
};

export function artifactTypeToFileName(artifactType: string): string {
  const fileName = ARTIFACT_FILE_NAMES[artifactType];

  if (!fileName) {
    throw new Error(`Unknown artifact type: ${artifactType}`);
  }

  return fileName;
}

export function artifactTypeToSchemaFileName(artifactType: string): string {
  const fileName = SCHEMA_FILE_NAMES[artifactType];

  if (!fileName) {
    throw new Error(`Unknown artifact type: ${artifactType}`);
  }

  return fileName;
}

export async function loadArtifactSchema(
  contractsDir: string,
  artifactType: string
): Promise<Record<string, unknown>> {
  const schemaPath = path.join(contractsDir, artifactTypeToSchemaFileName(artifactType));
  return JSON.parse(await readFile(schemaPath, "utf8"));
}

export function validateArtifactEnvelope(
  candidate: unknown,
  schema: Record<string, unknown>
): string[] {
  const schemaErrors = validateJsonSchema(candidate, schema);
  const invariantErrors = validateArtifactInvariants(candidate);
  return [...schemaErrors, ...invariantErrors];
}

export async function validateAndPersistArtifact(options: {
  artifact: ArtifactEnvelope;
  contractsDir: string;
  runDir: string;
  artifactFileName?: string;
  additionalErrors?: string[];
}): Promise<ArtifactValidationResult> {
  const artifactType = options.artifact?.artifact_type;
  const schema = await loadArtifactSchema(options.contractsDir, artifactType);
  const errors = [
    ...validateArtifactEnvelope(options.artifact, schema),
    ...(options.additionalErrors ?? [])
  ];
  const valid = errors.length === 0;
  const normalized = {
    ...options.artifact,
    status: valid ? "validated" : "rejected",
    validation: {
      valid,
      errors
    }
  } as ArtifactEnvelope;

  const artifactsDir = path.join(options.runDir, "artifacts");
  await mkdir(artifactsDir, { recursive: true });

  const persistedPath = valid
    ? path.join(artifactsDir, options.artifactFileName ?? artifactTypeToFileName(artifactType))
    : path.join(
        artifactsDir,
        "rejected",
        `${path.basename(artifactTypeToFileName(artifactType), ".json")}-${safeRef(normalized.artifact_id)}.json`
      );

  await mkdir(path.dirname(persistedPath), { recursive: true });
  await writeFile(persistedPath, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");

  return {
    valid,
    errors,
    artifact: normalized,
    persisted_path: persistedPath
  };
}

export async function readValidatedArtifact(runDir: string, artifactType: string): Promise<ArtifactEnvelope> {
  const artifactPath = path.join(runDir, "artifacts", artifactTypeToFileName(artifactType));
  const artifact = JSON.parse(await readFile(artifactPath, "utf8")) as ArtifactEnvelope;

  if (artifact.status !== "validated" || artifact.validation?.valid !== true) {
    throw new Error(`${artifactType} is not validated at ${artifactPath}`);
  }

  return artifact;
}

export function validateJsonSchema(value: unknown, schema: Record<string, unknown>, pointer = "$"): string[] {
  const errors: string[] = [];

  if (Array.isArray(schema.anyOf)) {
    const optionErrors = schema.anyOf.map((option) =>
      validateJsonSchema(value, option as Record<string, unknown>, pointer)
    );

    if (!optionErrors.some((items) => items.length === 0)) {
      errors.push(`${pointer} must match at least one allowed schema`);
    }

    return errors;
  }

  if ("const" in schema && value !== schema.const) {
    errors.push(`${pointer} must equal ${JSON.stringify(schema.const)}`);
  }

  if (Array.isArray(schema.enum) && !schema.enum.includes(value)) {
    errors.push(`${pointer} must be one of ${schema.enum.map((item) => JSON.stringify(item)).join(", ")}`);
  }

  if (schema.type && !matchesType(value, schema.type as string | string[])) {
    errors.push(`${pointer} must be ${Array.isArray(schema.type) ? schema.type.join(" or ") : schema.type}`);
    return errors;
  }

  if (typeof value === "string" && typeof schema.minLength === "number" && value.length < schema.minLength) {
    errors.push(`${pointer} must contain at least ${schema.minLength} character(s)`);
  }

  if (Array.isArray(value)) {
    if (typeof schema.minItems === "number" && value.length < schema.minItems) {
      errors.push(`${pointer} must contain at least ${schema.minItems} item(s)`);
    }

    if (schema.items && typeof schema.items === "object") {
      value.forEach((item, index) => {
        errors.push(
          ...validateJsonSchema(item, schema.items as Record<string, unknown>, `${pointer}[${index}]`)
        );
      });
    }
  }

  if (isPlainObject(value)) {
    const required = Array.isArray(schema.required) ? schema.required : [];

    for (const key of required) {
      if (!(key as string in value)) {
        errors.push(`${pointer}.${key as string} is required`);
      }
    }

    const properties = isPlainObject(schema.properties) ? schema.properties : {};

    for (const [key, childSchema] of Object.entries(properties)) {
      if (key in value) {
        errors.push(
          ...validateJsonSchema(
            (value as Record<string, unknown>)[key],
            childSchema as Record<string, unknown>,
            `${pointer}.${key}`
          )
        );
      }
    }

    if (schema.additionalProperties === false) {
      const allowed = new Set(Object.keys(properties));

      for (const key of Object.keys(value)) {
        if (!allowed.has(key)) {
          errors.push(`${pointer}.${key} is not allowed`);
        }
      }
    } else if (isPlainObject(schema.additionalProperties)) {
      const allowed = new Set(Object.keys(properties));

      for (const [key, childValue] of Object.entries(value)) {
        if (!allowed.has(key)) {
          errors.push(
            ...validateJsonSchema(
              childValue,
              schema.additionalProperties as Record<string, unknown>,
              `${pointer}.${key}`
            )
          );
        }
      }
    }
  }

  return errors;
}

function validateArtifactInvariants(candidate: unknown): string[] {
  if (!isPlainObject(candidate) || !isPlainObject(candidate.payload)) {
    return [];
  }

  const artifact = candidate as Record<string, unknown>;
  const payload = artifact.payload as Record<string, unknown>;
  const errors: string[] = [];

  if (
    artifact.artifact_type === "SectionGraph" &&
    payload.claim_policy === "proof-required" &&
    Array.isArray(payload.proof_bindings) &&
    payload.proof_bindings.length === 0
  ) {
    errors.push("$.payload.proof_bindings must not be empty when claim_policy is proof-required");
  }

  if (artifact.artifact_type === "DesignSpec") {
    const constraints = isPlainObject(payload.claim_and_proof_constraints)
      ? payload.claim_and_proof_constraints
      : {};
    const antiPatterns = isPlainObject(payload.anti_patterns) ? payload.anti_patterns : {};

    if (!Array.isArray(payload.section_design_intents) || payload.section_design_intents.length === 0) {
      errors.push("$.payload.section_design_intents must not be empty");
    }

    if (!hasNonEmptyStringArray(antiPatterns.visual)) {
      errors.push("$.payload.anti_patterns.visual must not be empty");
    }

    if (!hasNonEmptyStringArray(antiPatterns.copy)) {
      errors.push("$.payload.anti_patterns.copy must not be empty");
    }

    if (!hasNonEmptyStringArray(antiPatterns.proof)) {
      errors.push("$.payload.anti_patterns.proof must not be empty");
    }

    if (
      constraints.claim_policy !== "proof-required" &&
      constraints.claim_policy !== "low-proof" &&
      constraints.claim_policy !== "no-claims"
    ) {
      errors.push("$.payload.claim_and_proof_constraints.claim_policy must be a supported claim policy");
    }
  }

  if (artifact.artifact_type === "QAReport") {
    const issues = Array.isArray(payload.issues) ? payload.issues : [];
    const gateResults = Array.isArray(payload.gate_results) ? payload.gate_results : [];
    const blockingIssues = issues.filter((issue) => isPlainObject(issue) && issue.blocking === true);

    if (payload.verdict === "pass" && blockingIssues.length > 0) {
      errors.push("$.payload.verdict cannot be pass while blocking issues remain");
    }

    if (payload.verdict === "waived" && payload.waiver === null) {
      errors.push("$.payload.waiver is required when verdict is waived");
    }

    if (payload.verdict === "waived") {
      const nonWaivableFailure = gateResults.some(
        (gate) => isPlainObject(gate) && gate.result === "fail" && gate.waivable === false
      );

      if (nonWaivableFailure) {
        errors.push("$.payload.waiver cannot cover failed non-waivable gates");
      }
    }
  }

  return errors;
}

function matchesType(value: unknown, expected: string | string[]): boolean {
  const expectedTypes = Array.isArray(expected) ? expected : [expected];
  return expectedTypes.some((type) => {
    if (type === "array") {
      return Array.isArray(value);
    }

    if (type === "object") {
      return isPlainObject(value);
    }

    if (type === "null") {
      return value === null;
    }

    if (type === "integer") {
      return Number.isInteger(value);
    }

    return typeof value === type;
  });
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasNonEmptyStringArray(value: unknown): boolean {
  return Array.isArray(value) && value.some((item) => typeof item === "string" && item.trim().length > 0);
}

function safeRef(value: unknown): string {
  if (typeof value !== "string" || value.length === 0) {
    return `unknown_${Date.now().toString(36)}`;
  }

  return value.replace(/[^a-zA-Z0-9_.-]/g, "_");
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const [artifactPath, contractsDir = path.resolve("superpowers/contracts/artifacts")] = process.argv.slice(2);

  if (!artifactPath) {
    console.error(
      "Usage: node --experimental-strip-types superpowers/runner/validate-artifact.ts <artifact.json> [contractsDir]"
    );
    process.exit(1);
  }

  const artifact = JSON.parse(await readFile(artifactPath, "utf8")) as ArtifactEnvelope;
  const schema = await loadArtifactSchema(contractsDir, artifact.artifact_type);
  const errors = validateArtifactEnvelope(artifact, schema);

  console.log(
    JSON.stringify(
      {
        valid: errors.length === 0,
        errors
      },
      null,
      2
    )
  );

  process.exit(errors.length === 0 ? 0 : 1);
}
