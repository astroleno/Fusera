# Graph Report - .  (2026-05-13)

## Corpus Check
- 113 files · ~99,028 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 475 nodes · 1069 edges · 42 communities detected
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 72 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]

## God Nodes (most connected - your core abstractions)
1. `verifyP0Harness()` - 32 edges
2. `readJson()` - 24 edges
3. `verifyLiveCodexQuality()` - 23 edges
4. `resumeFailedRun()` - 22 edges
5. `continueStageProof()` - 20 edges
6. `runFixture()` - 17 edges
7. `withEnv()` - 15 edges
8. `verifyLiveCodexMatrix()` - 13 edges
9. `executeStage()` - 12 edges
10. `runCli()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `persistStageOutputs()` --calls--> `compilePage()`  [INFERRED]
  superpowers/runner/run-stage.ts → src/lib/page-spec/compile-page.ts
- `persistStageOutputs()` --calls--> `persistRepairDecision()`  [INFERRED]
  superpowers/runner/run-stage.ts → superpowers/runner/repair-run.ts
- `inspectCommand()` --calls--> `formatInspectionText()`  [INFERRED]
  superpowers/runner/cli.ts → superpowers/runner/inspect-run.ts
- `compilePage()` --calls--> `stableHash()`  [EXTRACTED]
  src/lib/page-spec/compile-page.ts → superpowers/runner/compile-page.ts
- `compilePage()` --calls--> `readValidatedArtifact()`  [INFERRED]
  src/lib/page-spec/compile-page.ts → superpowers/runner/validate-artifact.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (55): acceptableFinalStates(), artifactTypesForTargetStage(), baseArtifactScore(), codexVersionFromTranscript(), configuredModelFromArgs(), containsPlaceholder(), ctaAlignmentDetails(), dominantKnownDirection() (+47 more)

### Community 1 - "Community 1"
Cohesion: 0.1
Nodes (46): decideRetry(), decision(), normalizeFailureMode(), persistRetryDecision(), adapterModeFromAdapterResult(), adapterModeFromValue(), adapterModesFromStageEvidence(), adapterOwnedOutputs() (+38 more)

### Community 2 - "Community 2"
Cohesion: 0.15
Nodes (42): runStageProof(), checkAdapterCandidateGuards(), checkArtifactExtractor(), checkArtifactsValidate(), checkAttemptScopedEvidence(), checkBackendRetryBudgetExhausted(), checkCompiledPackBundle(), checkContextStatusAndVersionRejected() (+34 more)

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (24): compilePage(), stableHash(), createDbClient(), loadProjectPreview(), assertPublishable(), publishPreview(), stableHash(), decideRepair() (+16 more)

### Community 4 - "Community 4"
Cohesion: 0.13
Nodes (32): accountingSummary(), artifactScoreDrift(), canonicalLiveDefaults(), defaultEnvForAdapterMode(), durationStats(), errorMessage(), errorStack(), failedRunResult() (+24 more)

### Community 5 - "Community 5"
Cohesion: 0.14
Nodes (23): hasCodexCapabilities(), missingCodexCapabilities(), compilePack(), materializeReference(), materializeReferences(), positiveIntegerFromEnv(), readFileSlice(), assignKeyValue() (+15 more)

### Community 6 - "Community 6"
Cohesion: 0.16
Nodes (22): extractAdapterOutputFromText(), extractArtifactsFromText(), extractAttachmentsFromText(), extractJsonBlocks(), adapterUsage(), appendLine(), buildPrompt(), codexVersionFromTranscript() (+14 more)

### Community 7 - "Community 7"
Cohesion: 0.18
Nodes (20): countFailureModes(), fileExists(), formatInspectionText(), hasAttemptEvidence(), hasEvent(), inferAdapterModeFromStages(), inspectArtifacts(), inspectRun() (+12 more)

### Community 8 - "Community 8"
Cohesion: 0.17
Nodes (21): artifactScoreRegressionsFor(), artifactSummary(), attachTrendChecks(), countAttempts(), executionEnvironment(), findBaselineCaseResult(), matrixReportPath(), maybeRetryQualityRun() (+13 more)

### Community 9 - "Community 9"
Cohesion: 0.28
Nodes (19): artifact(), artifactId(), artifactPrefix(), getInput(), makeArtifact(), makeBrandProfile(), makeDesignSpec(), makePagePlan() (+11 more)

### Community 10 - "Community 10"
Cohesion: 0.27
Nodes (20): adapterModeFlag(), checkReadable(), checkWritableRuntime(), ciCommand(), continueCommand(), doctorCommand(), inspectCommand(), liveStabilityCommand() (+12 more)

### Community 11 - "Community 11"
Cohesion: 0.19
Nodes (14): runCiIsolatedLive(), applyBaselineEnv(), verifyLiveCodexBaseline(), writeLatestBaselineIndex(), cleanupWorkdir(), compactIndex(), isInside(), isolatedReportPath() (+6 more)

### Community 12 - "Community 12"
Cohesion: 0.23
Nodes (14): checkNodeVersion(), checkPackageBin(), checkPath(), compareVersions(), normalizeFirstPathAfter(), normalizeFixedPath(), normalizePath(), normalizeRunnerArgs() (+6 more)

### Community 13 - "Community 13"
Cohesion: 0.25
Nodes (13): createCodexAdapter(), assembleContext(), compareSemver(), dedupeArtifactRequirements(), parseSemver(), readJsonIfPresent(), satisfiesVersionRange(), adapterModeFromEnv() (+5 more)

### Community 14 - "Community 14"
Cohesion: 0.35
Nodes (9): checkCodexAuthProbe(), checkCodexVersion(), checkGithubActionsContext(), checkLiveRunner(), checkNodeVersion(), checkRuntimeDirectory(), errorMessage(), numberFromEnv() (+1 more)

### Community 15 - "Community 15"
Cohesion: 0.44
Nodes (9): checkFinalState(), checkPreviewBindings(), checkPreviewPublishScope(), checkPublishEvents(), checkRunnerOwnedArtifacts(), checkRunnerOwnedBackendEvidence(), readEvents(), readJson() (+1 more)

### Community 16 - "Community 16"
Cohesion: 0.33
Nodes (4): createArtifactEnvelope(), buildPageArtifacts(), buildBrandProfile(), buildProductBrief()

### Community 17 - "Community 17"
Cohesion: 1.0
Nodes (2): handleSubmit(), splitLines()

### Community 18 - "Community 18"
Cohesion: 0.67
Nodes (0): 

### Community 19 - "Community 19"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Community 20"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Community 21"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Community 22"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Community 23"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Community 25"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Community 26"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Community 29"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "Community 30"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Community 31"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Community 32"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Community 33"
Cohesion: 1.0
Nodes (0): 

### Community 34 - "Community 34"
Cohesion: 1.0
Nodes (0): 

### Community 35 - "Community 35"
Cohesion: 1.0
Nodes (0): 

### Community 36 - "Community 36"
Cohesion: 1.0
Nodes (0): 

### Community 37 - "Community 37"
Cohesion: 1.0
Nodes (0): 

### Community 38 - "Community 38"
Cohesion: 1.0
Nodes (0): 

### Community 39 - "Community 39"
Cohesion: 1.0
Nodes (0): 

### Community 40 - "Community 40"
Cohesion: 1.0
Nodes (0): 

### Community 41 - "Community 41"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Community 19`** (2 nodes): `HomePage()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (2 nodes): `artifactRow()`, `generate-page.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (2 nodes): `RootLayout()`, `layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (2 nodes): `NewProjectPage()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (2 nodes): `requestRegeneration()`, `micro-adjustments-panel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (2 nodes): `scorePageQuality()`, `quality-score.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (1 nodes): `project-generation.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (1 nodes): `score-page.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (1 nodes): `quality-score.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (1 nodes): `page-preview.test.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (1 nodes): `page-compiler.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (1 nodes): `project-intake-form.test.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (1 nodes): `projects-route.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (1 nodes): `generate-page.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (1 nodes): `app-shell.test.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (1 nodes): `micro-adjustments-panel.test.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (1 nodes): `project-input.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (1 nodes): `setup.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (1 nodes): `project-input.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (1 nodes): `project-preview-loader.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (1 nodes): `generation-route.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (1 nodes): `registry.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createCodexAdapter()` connect `Community 13` to `Community 9`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Why does `invokeBackend()` connect `Community 13` to `Community 1`, `Community 2`, `Community 6`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `verifyP0Harness()` (e.g. with `verifyCommand()` and `runFixture()`) actually correct?**
  _`verifyP0Harness()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `verifyLiveCodexQuality()` (e.g. with `verifyLiveCodexMatrix()` and `maybeRetryQualityRun()`) actually correct?**
  _`verifyLiveCodexQuality()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `resumeFailedRun()` (e.g. with `decideRetry()` and `persistRetryDecision()`) actually correct?**
  _`resumeFailedRun()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `continueStageProof()` (e.g. with `writeRunEvent()` and `continueCommand()`) actually correct?**
  _`continueStageProof()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._