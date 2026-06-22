---
name: landing-copy-seo
description: Generate or refine landing-page copy, conversion hierarchy, accessibility text, and basic SEO metadata for a website implementation. Use when the page needs real marketing content rather than placeholder text.
---

# Landing Copy & SEO

这个 skill 负责把视觉型 prompt 转成能转化的落地页内容，避免只做“炫酷壳子”。

## 什么时候使用

- 用户只给了产品方向，没有给完整文案。
- 知识库 prompt 视觉很强，但业务内容不足。
- 页面需要 CTA、SEO title、meta description、FAQ、proof points。
- 页面需要中文/英文/双语内容。

## 输出内容

```md
## Copy system
- Brand voice:
- Primary headline:
- Subheadline:
- Primary CTA:
- Secondary CTA:
- Trust line:

## Section copy
1. Hero
2. Problem / Value
3. Features
4. Proof / Metrics
5. CTA
6. Footer

## SEO
- Title:
- Meta description:
- OG title:
- OG description:

## Accessibility text
- Video fallback text:
- Image alt text:
- Button aria-labels:
- Form labels/errors:
```

## 文案规则

- 首屏标题尽量 6–12 个英文词或 8–18 个中文字符，强调结果而非功能堆砌。
- 副标题解释对象、价值和差异化。
- CTA 要具体，比如 `Book a demo`、`Join waitlist`、`Start building`，不要只写 `Click here`。
- 每个 feature 只表达一个利益点。
- 不要编造真实客户、奖项、融资、合规认证；除非用户提供。
- 视频背景必须有可读 fallback 文案，不能让信息只存在于视频里。

## SEO / A11y 门槛

- 页面只有一个 H1。
- CTA button / link 有清晰文本。
- 图片有 alt；纯装饰图片用空 alt。
- 表单有 label、错误提示和成功状态。
- Meta description 控制在 120–160 英文字符左右；中文可更短。
