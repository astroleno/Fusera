# Website Prompt Knowledge Base

本目录是从用户上传的 `prompts-md.zip` 清理生成的本地知识库。

- `prompts/`：修正文件名后的编号 prompt md，共 71 个。
- `prompt_inventory.json`：每个 prompt 的标题、质量、标签、路径。
- `prompt_inventory.csv`：适合表格浏览的清单。
- `route_index.yaml`：知识库路由规则，供 agent 或脚本读取。
- `route_index.md`：人类可读的路由索引。
- `topic_map.md`：按标签聚合的候选 prompt。
- `prompt_reuse_matrix.md`：每个 prompt 的最佳复用方式。
- `patterns/`：从 prompt 语料沉淀出的可复用 layout/motion/asset recipes。
- `fulltext/ALL_PROMPTS.md`：原始合并全文，便于全文搜索和人工查阅。

## 路由建议

1. 用 `scripts/kb_router.py` 根据用户 brief 初筛候选。
2. 先打开 `patterns/` 中对应 recipe，再打开候选 md，提取可复用 pattern：视觉方向、section 结构、动效、组件组织、素材策略。
3. 只选择 1 个主参考 + 最多 3 个辅助参考。
4. `stub_or_empty` 文件只能作为命名/主题灵感，不能作为实现依据。
5. 外部 URL 仅作为素材线索，生产落地时需要 asset hardening。
