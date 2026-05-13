# Fusera Project Guide

## Knowledge Graph

本项目已构建 [graphify](https://github.com/safishamsi/graphify) 知识图谱，位于 `graphify-out/`。

### 架构概览

- **475 个代码符号**，分布在 **42 个社区**
- **1,069 条关系边**（调用、导入、依赖）
- **核心模块**：P0 验证、质量检查、阶段证明、错误恢复、CLI

### God Nodes（系统核心抽象）

| 节点 | 连接数 | 职责 |
|------|--------|------|
| `verifyP0Harness()` | 32 | 测试验证入口 |
| `readJson()` | 24 | 配置读取 |
| `verifyLiveCodexQuality()` | 23 | 实时质量验证 |
| `resumeFailedRun()` | 22 | 失败运行恢复 |
| `continueStageProof()` | 20 | 阶段证明继续 |

### 关键桥梁节点（跨社区连接器）

⚠️ **修改这些节点需格外谨慎** - 它们是模块间的关键连接：

- `createCodexAdapter()` - 连接 Community 13 ↔ Community 9
- `invokeBackend()` - 连接 Community 13 ↔ Community 1/2/6

### 使用图谱的方法

```bash
# 探索节点功能
/graphify explain "verifyP0Harness"

# 查找两个概念之间的路径
/graphify path "resumeFailedRun" "verifyP0Harness"

# 查询特定问题
/graphify query "How does error recovery work?"
```

### 编码规范（基于图谱发现）

1. **修改前检查影响范围**
   - 运行 `/graphify path "yourFunction" "verifyP0Harness"` 了解上游依赖
   - 运行 `/graphify path "verifyP0Harness" "yourFunction"` 了解下游影响

2. **保护桥梁节点**
   - 修改 `createCodexAdapter()` 或 `invokeBackend()` 前，检查所有连接的社区

3. **社区边界意识**
   - Community 0-4: 核心业务逻辑（高内聚）
   - Community 5+: 工具函数、CLI 命令（辅助功能）

4. **添加新功能**
   - 优先在与相关功能相同的社区内添加
   - 如需跨社区连接，通过现有桥梁节点或创建新的适配器

## 项目结构

```
.
├── src/           # 核心应用代码
├── superpowers/   # 插件/扩展系统
├── tests/         # 测试文件
├── bin/           # CLI 工具
├── docs/          # 文档
└── graphify-out/  # 知识图谱输出
    ├── graph.html       # 交互式可视化
    ├── graph.json       # 原始图数据
    └── GRAPH_REPORT.md  # 完整审计报告
```

## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only when the graph doesn't cover what you need**.

### Key Tools

| Tool | Use when |
|------|----------|
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)
