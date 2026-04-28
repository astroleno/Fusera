import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import type { ArtifactEnvelope } from "../../runner/validate-artifact.ts";

export type ArtifactExtractionResult = {
  candidates: ArtifactEnvelope[];
  errors: string[];
};

export type AdapterAttachment = {
  kind: string;
  file_name?: string;
  body: Record<string, unknown>;
};

export type AttachmentExtractionResult = {
  attachments: AdapterAttachment[];
  errors: string[];
};

export type AdapterOutputExtractionResult = {
  candidates: ArtifactEnvelope[];
  attachments: AdapterAttachment[];
  errors: string[];
};

export function extractArtifactsFromText(text: string): ArtifactExtractionResult {
  const result = extractJsonBlocks<ArtifactEnvelope>(text, "fusera-artifact-json", "artifact");

  return {
    candidates: result.items,
    errors: result.errors
  };
}

export function extractAttachmentsFromText(text: string): AttachmentExtractionResult {
  const result = extractJsonBlocks<AdapterAttachment>(text, "fusera-attachment-json", "attachment");
  const attachments: AdapterAttachment[] = [];
  const errors = [...result.errors];

  for (const item of result.items) {
    if (
      typeof item.kind === "string" &&
      typeof item.body === "object" &&
      item.body !== null &&
      !Array.isArray(item.body)
    ) {
      attachments.push(item);
    } else {
      errors.push("Invalid attachment JSON block: expected kind string and body object");
    }
  }

  return {
    attachments,
    errors
  };
}

export function extractAdapterOutputFromText(text: string): AdapterOutputExtractionResult {
  const artifactExtraction = extractArtifactsFromText(text);
  const attachmentExtraction = extractAttachmentsFromText(text);

  return {
    candidates: artifactExtraction.candidates,
    attachments: attachmentExtraction.attachments,
    errors: [...artifactExtraction.errors, ...attachmentExtraction.errors]
  };
}

function extractJsonBlocks<T>(
  text: string,
  fenceName: string,
  label: string
): { items: T[]; errors: string[] } {
  const pattern = new RegExp(`\`\`\`${fenceName}\\s*([\\s\\S]*?)\`\`\``, "g");
  const items: T[] = [];
  const errors: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    const rawJson = match[1].trim();

    try {
      items.push(JSON.parse(rawJson) as T);
    } catch (error) {
      errors.push(`Invalid ${label} JSON block: ${(error as Error).message}`);
    }
  }

  return {
    items,
    errors
  };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const [filePath] = process.argv.slice(2);

  if (!filePath) {
    console.error("Usage: node --experimental-strip-types superpowers/adapters/codex/extract-artifacts.ts <output.txt>");
    process.exit(1);
  }

  const result = extractAdapterOutputFromText(await readFile(filePath, "utf8"));
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.errors.length === 0 ? 0 : 1);
}
