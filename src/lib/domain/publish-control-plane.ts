import { z } from "zod";
import {
  productBriefPayloadSchema,
  sectionGraphPayloadSchema,
} from "./page-artifacts";

const nonEmptyString = z.string().min(1);

export const publishExportOperationTypeSchema = z.enum(["export", "publish"]);

export const publishExportOperationStatusSchema = z.enum([
  "requested",
  "blocked",
  "ready",
  "external_pending",
  "external_succeeded",
  "external_failed",
  "cancelled",
]);

export const publishExportRequestSchema = z
  .object({
    operationType: publishExportOperationTypeSchema.optional(),
    externalTarget: z.record(z.unknown()).optional(),
  })
  .strict();

export const publishExportOperationTransitionRequestSchema = z
  .object({
    status: publishExportOperationStatusSchema,
    operationType: publishExportOperationTypeSchema.optional(),
    externalTarget: z.record(z.unknown()).optional(),
    externalResult: z.record(z.unknown()).optional(),
  })
  .strict();

export const publishExportOperationDiagnosticSchema = z
  .object({
    code: nonEmptyString,
    severity: z.literal("blocking"),
    message: nonEmptyString,
    artifactType: nonEmptyString,
    artifactRef: nonEmptyString.nullable(),
    details: z.record(z.unknown()).default({}),
  })
  .strict();

export const publishExportOperationInsertSchema = z
  .object({
    project_id: nonEmptyString,
    run_id: nonEmptyString,
    operation_type: publishExportOperationTypeSchema,
    status: publishExportOperationStatusSchema,
    page_spec_ref: nonEmptyString,
    qa_report_ref: nonEmptyString,
    publish_version_ref: nonEmptyString.nullable(),
    preview_build_ref: nonEmptyString,
    failure_code: nonEmptyString.nullable(),
    failure_reason: nonEmptyString.nullable(),
    diagnostics: z.array(publishExportOperationDiagnosticSchema),
    external_target: z.record(z.unknown()).nullable(),
    external_result: z.record(z.unknown()).nullable(),
  })
  .strict();

export type PublishExportOperationType = z.infer<
  typeof publishExportOperationTypeSchema
>;
export type PublishExportOperationStatus = z.infer<
  typeof publishExportOperationStatusSchema
>;
export type PublishExportRequest = z.infer<typeof publishExportRequestSchema>;
export type PublishExportOperationTransitionRequest = z.infer<
  typeof publishExportOperationTransitionRequestSchema
>;
export type PublishExportOperationDiagnostic = z.infer<
  typeof publishExportOperationDiagnosticSchema
>;
export type PublishExportOperationInsert = z.infer<
  typeof publishExportOperationInsertSchema
>;

export type PublishExportDiagnosticInspection = {
  code: string;
  severity: "blocking";
  message: string;
  artifactType: string;
  artifactRef: string | null;
  details: Record<string, unknown>;
  operatorMessage: string;
  remediation: string;
};

export const publishExportAllowedTransitions: Record<
  PublishExportOperationStatus,
  PublishExportOperationStatus[]
> = {
  requested: ["blocked", "ready", "cancelled"],
  blocked: [],
  ready: ["external_pending", "cancelled"],
  external_pending: ["external_succeeded", "external_failed"],
  external_succeeded: [],
  external_failed: ["ready", "cancelled"],
  cancelled: [],
};

export function canTransitionPublishExportOperation(
  from: PublishExportOperationStatus,
  to: PublishExportOperationStatus,
) {
  return publishExportAllowedTransitions[from].includes(to);
}

export function assertPublishExportOperationTransition(
  from: PublishExportOperationStatus,
  to: PublishExportOperationStatus,
) {
  if (!canTransitionPublishExportOperation(from, to)) {
    throw new Error(`Invalid publish/export transition: ${from} -> ${to}`);
  }
}

export function initialExportStateForCompletedGeneration() {
  return "none" as const;
}

export function createReadyPublishExportOperation(params: {
  projectId: string;
  runId: string;
  operationType: PublishExportOperationType;
  pageSpecRef: string;
  qaReportRef: string;
  publishVersionRef: string | null;
  previewBuildRef: string;
  externalTarget?: Record<string, unknown>;
}): PublishExportOperationInsert {
  return publishExportOperationInsertSchema.parse({
    project_id: params.projectId,
    run_id: params.runId,
    operation_type: params.operationType,
    status: "ready",
    page_spec_ref: params.pageSpecRef,
    qa_report_ref: params.qaReportRef,
    publish_version_ref: params.publishVersionRef,
    preview_build_ref: params.previewBuildRef,
    failure_code: null,
    failure_reason: null,
    diagnostics: [],
    external_target: params.externalTarget ?? null,
    external_result: null,
  });
}

export function createBlockedPublishExportOperation(params: {
  projectId: string;
  runId: string;
  operationType: PublishExportOperationType;
  pageSpecRef: string;
  qaReportRef: string;
  publishVersionRef: string | null;
  previewBuildRef: string;
  diagnostics: PublishExportOperationDiagnostic[];
  externalTarget?: Record<string, unknown>;
}): PublishExportOperationInsert {
  const firstDiagnostic = params.diagnostics[0];

  return publishExportOperationInsertSchema.parse({
    project_id: params.projectId,
    run_id: params.runId,
    operation_type: params.operationType,
    status: "blocked",
    page_spec_ref: params.pageSpecRef,
    qa_report_ref: params.qaReportRef,
    publish_version_ref: params.publishVersionRef,
    preview_build_ref: params.previewBuildRef,
    failure_code: firstDiagnostic?.code ?? "proof_hard_gate_blocked",
    failure_reason:
      firstDiagnostic?.message ?? "Proof hard gate blocked publish/export.",
    diagnostics: params.diagnostics,
    external_target: params.externalTarget ?? null,
    external_result: null,
  });
}

export function proofGateDiagnostic(params: {
  code: string;
  message: string;
  artifactType: string;
  artifactRef: string | null;
  details?: Record<string, unknown>;
}): PublishExportOperationDiagnostic {
  return publishExportOperationDiagnosticSchema.parse({
    code: params.code,
    severity: "blocking",
    message: params.message,
    artifactType: params.artifactType,
    artifactRef: params.artifactRef,
    details: params.details ?? {},
  });
}

export function evaluateProofHardGate(input: {
  productBriefPayload: unknown;
  productBriefRef: string;
  sectionGraphPayload: unknown;
  sectionGraphRef: string;
}): PublishExportOperationDiagnostic[] {
  const diagnostics: PublishExportOperationDiagnostic[] = [];
  const productBrief = productBriefPayloadSchema.safeParse(
    input.productBriefPayload,
  );
  const sectionGraph = sectionGraphPayloadSchema.safeParse(
    input.sectionGraphPayload,
  );

  if (!productBrief.success) {
    diagnostics.push(
      proofGateDiagnostic({
        code: "product_brief_payload_invalid",
        message:
          "ProductBrief payload cannot be parsed for ClaimRef/ProofRef checks.",
        artifactType: "ProductBrief",
        artifactRef: input.productBriefRef,
        details: { errors: productBrief.error.flatten() },
      }),
    );
  }

  if (!sectionGraph.success) {
    diagnostics.push(
      proofGateDiagnostic({
        code: "section_graph_payload_invalid",
        message: "SectionGraph payload cannot be parsed for ProofRef binding checks.",
        artifactType: "SectionGraph",
        artifactRef: input.sectionGraphRef,
        details: { errors: sectionGraph.error.flatten() },
      }),
    );
  }

  if (!productBrief.success || !sectionGraph.success) {
    return diagnostics;
  }

  const proofSourcesByRef = new Map(
    productBrief.data.proof_sources.map((proofSource) => [
      proofSource.proof_ref,
      proofSource,
    ]),
  );
  const duplicateProofRefs = productBrief.data.proof_sources
    .map((proofSource) => proofSource.proof_ref)
    .filter(
      (proofRef, index, proofRefs) => proofRefs.indexOf(proofRef) !== index,
    );

  for (const proofRef of new Set(duplicateProofRefs)) {
    diagnostics.push(
      proofGateDiagnostic({
        code: "duplicate_proof_ref",
        message: `ProofRef ${proofRef} appears more than once in ProductBrief.`,
        artifactType: "ProductBrief",
        artifactRef: input.productBriefRef,
        details: { proofRef },
      }),
    );
  }

  if (
    productBrief.data.claim_policy === "proof-required" &&
    productBrief.data.proof_sources.length === 0
  ) {
    diagnostics.push(
      proofGateDiagnostic({
        code: "proof_required_without_proof_refs",
        message: "ProductBrief claim_policy is proof-required but has no ProofRefs.",
        artifactType: "ProductBrief",
        artifactRef: input.productBriefRef,
      }),
    );
  }

  if (
    productBrief.data.claim_policy === "proof-required" &&
    productBrief.data.claim_refs.length === 0
  ) {
    diagnostics.push(
      proofGateDiagnostic({
        code: "proof_required_without_claim_refs",
        message: "ProductBrief claim_policy is proof-required but has no ClaimRefs.",
        artifactType: "ProductBrief",
        artifactRef: input.productBriefRef,
      }),
    );
  }

  for (const claimRef of productBrief.data.claim_refs) {
    if (claimRef.proof_refs.length === 0) {
      diagnostics.push(
        proofGateDiagnostic({
          code: "claim_ref_without_proof_refs",
          message: `ClaimRef ${claimRef.claim_ref} has no ProofRefs.`,
          artifactType: "ProductBrief",
          artifactRef: input.productBriefRef,
          details: { claimRef: claimRef.claim_ref },
        }),
      );
    }

    for (const proofRef of claimRef.proof_refs) {
      const proofSource = proofSourcesByRef.get(proofRef);

      if (!proofSource) {
        diagnostics.push(
          proofGateDiagnostic({
            code: "claim_ref_unknown_proof_ref",
            message: `ClaimRef ${claimRef.claim_ref} points at missing ProofRef ${proofRef}.`,
            artifactType: "ProductBrief",
            artifactRef: input.productBriefRef,
            details: { claimRef: claimRef.claim_ref, proofRef },
          }),
        );
        continue;
      }

      if (proofSource.claim !== claimRef.claim) {
        diagnostics.push(
          proofGateDiagnostic({
            code: "claim_proof_claim_mismatch",
            message: `ClaimRef ${claimRef.claim_ref} claim does not match ProofRef ${proofRef}.`,
            artifactType: "ProductBrief",
            artifactRef: input.productBriefRef,
            details: {
              claimRef: claimRef.claim_ref,
              proofRef,
              claim: claimRef.claim,
              proofClaim: proofSource.claim,
            },
          }),
        );
      }
    }
  }

  const sectionIds = new Set(
    sectionGraph.data.nodes.map((node) => node.section_id),
  );
  const sectionGraphProofRefs = new Set(
    sectionGraph.data.proof_bindings.map((proofBinding) => proofBinding.proof_ref),
  );

  for (const proofSource of productBrief.data.proof_sources) {
    if (!sectionGraphProofRefs.has(proofSource.proof_ref)) {
      diagnostics.push(
        proofGateDiagnostic({
          code: "proof_ref_not_bound_to_section_graph",
          message: `ProofRef ${proofSource.proof_ref} is not bound in SectionGraph.`,
          artifactType: "SectionGraph",
          artifactRef: input.sectionGraphRef,
          details: { proofRef: proofSource.proof_ref },
        }),
      );
    }
  }

  for (const proofBinding of sectionGraph.data.proof_bindings) {
    if (!sectionIds.has(proofBinding.section_id)) {
      diagnostics.push(
        proofGateDiagnostic({
          code: "proof_binding_unknown_section",
          message: `Proof binding references unknown section ${proofBinding.section_id}.`,
          artifactType: "SectionGraph",
          artifactRef: input.sectionGraphRef,
          details: { sectionId: proofBinding.section_id },
        }),
      );
    }

    if (!proofSourcesByRef.has(proofBinding.proof_ref)) {
      diagnostics.push(
        proofGateDiagnostic({
          code: "section_graph_unknown_proof_ref",
          message: `SectionGraph proof binding points at missing ProofRef ${proofBinding.proof_ref}.`,
          artifactType: "SectionGraph",
          artifactRef: input.sectionGraphRef,
          details: {
            sectionId: proofBinding.section_id,
            proofRef: proofBinding.proof_ref,
          },
        }),
      );
    }
  }

  return diagnostics;
}

const diagnosticCopy: Record<
  string,
  { operatorMessage: string; remediation: string }
> = {
  missing_product_brief_ref: {
    operatorMessage: "Latest run has no ProductBrief ref for proof checks.",
    remediation: "Regenerate the page so the full artifact spine includes ProductBrief.",
  },
  missing_section_graph_ref: {
    operatorMessage: "Latest run has no SectionGraph ref for proof checks.",
    remediation: "Regenerate the page so the full artifact spine includes SectionGraph.",
  },
  product_brief_artifact_missing: {
    operatorMessage: "The referenced ProductBrief artifact is missing.",
    remediation: "Regenerate the page or inspect artifact persistence for the run.",
  },
  section_graph_artifact_missing: {
    operatorMessage: "The referenced SectionGraph artifact is missing.",
    remediation: "Regenerate the page or inspect artifact persistence for the run.",
  },
  product_brief_artifact_not_validated: {
    operatorMessage: "The ProductBrief artifact is not validated.",
    remediation: "Review ProductBrief validation errors and regenerate the artifact.",
  },
  section_graph_artifact_not_validated: {
    operatorMessage: "The SectionGraph artifact is not validated.",
    remediation: "Review SectionGraph validation errors and regenerate the artifact.",
  },
  product_brief_payload_invalid: {
    operatorMessage: "The ProductBrief payload cannot be parsed.",
    remediation: "Fix ProductBrief schema output before retrying publish/export.",
  },
  section_graph_payload_invalid: {
    operatorMessage: "The SectionGraph payload cannot be parsed.",
    remediation: "Fix SectionGraph schema output before retrying publish/export.",
  },
  duplicate_proof_ref: {
    operatorMessage: "A ProofRef appears more than once.",
    remediation: "Deduplicate ProductBrief proof_sources so each proof_ref is unique.",
  },
  proof_required_without_proof_refs: {
    operatorMessage: "Proof is required, but no ProofRefs are present.",
    remediation: "Add proof sources or lower the claim policy before retrying.",
  },
  proof_required_without_claim_refs: {
    operatorMessage: "Proof is required, but no ClaimRefs are present.",
    remediation: "Bind claims to ProofRefs before retrying publish/export.",
  },
  claim_ref_without_proof_refs: {
    operatorMessage: "A ClaimRef has no ProofRefs.",
    remediation: "Attach at least one matching ProofRef to every ClaimRef.",
  },
  claim_ref_unknown_proof_ref: {
    operatorMessage: "A ClaimRef points at a missing ProofRef.",
    remediation: "Add the referenced ProofRef or update the ClaimRef binding.",
  },
  claim_proof_claim_mismatch: {
    operatorMessage: "A ClaimRef claim does not match its ProofRef claim.",
    remediation: "Align the claim text on ClaimRef and ProofRef before retrying.",
  },
  proof_ref_not_bound_to_section_graph: {
    operatorMessage: "A ProofRef is not bound into the SectionGraph.",
    remediation: "Add a SectionGraph proof binding for the ProofRef.",
  },
  proof_binding_unknown_section: {
    operatorMessage: "A proof binding points at an unknown section.",
    remediation: "Bind proof only to section ids present in SectionGraph.nodes.",
  },
  section_graph_unknown_proof_ref: {
    operatorMessage: "SectionGraph binds a missing ProofRef.",
    remediation: "Update SectionGraph proof_bindings to reference ProductBrief ProofRefs.",
  },
};

export function inspectPublishExportDiagnostic(
  diagnostic: PublishExportOperationDiagnostic,
): PublishExportDiagnosticInspection {
  const copy = diagnosticCopy[diagnostic.code] ?? {
    operatorMessage: diagnostic.message,
    remediation: "Inspect the operation diagnostic details and regenerate if needed.",
  };

  return {
    ...diagnostic,
    operatorMessage: copy.operatorMessage,
    remediation: copy.remediation,
  };
}
