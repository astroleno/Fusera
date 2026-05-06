# Startup Distribution Contract

Date: 2026-05-05
Status: P1 implementation contract

## Scope

Fusera skills-only install creates a companion bundle. It is not a self-contained runtime distribution. It requires a local Fusera `source_root`.

## Roots

- `source_root`: Fusera checkout containing `superpowers/`.
- `workspace_root`: caller workspace receiving repo-local host integration files.

## Supported Scopes

- `codex-global`: writes to `~/.codex/skills/fusera`.
- `repo-local`: writes to `<workspace_root>/.agents/skills/fusera`.

`opencode` is deferred.

## Resolution Contract

Copied pack `SKILL.md` files are index snapshots for host reading. They are not standalone pack distributions.

Authoritative resolution must go through `source_root`:

- pack registry: `<source_root>/superpowers/packs/registry.yaml`
- stage profiles: `<source_root>/superpowers/packs/stage-profiles.yaml`
- artifact schemas: `<source_root>/superpowers/contracts/artifacts/`
- reference material: `<source_root>/reference/`
- runner source: `<source_root>/superpowers/runner/`

## Backend Claims

Generated bundle metadata must contain:

```json
{
  "runtime_supported_backends": ["codex"],
  "instruction_only_backends": ["claude-code"]
}
```

The companion bundle must not claim Claude Code runtime parity.

## Installer Contract

The installer must require `--scope`, support `--dry-run`, be idempotent, and replace only files listed in the previous generated manifest.

The installer must not copy canonical artifact schemas into the companion bundle. The manifest points to `source_root` for schemas so there is only one authoritative contract surface.
