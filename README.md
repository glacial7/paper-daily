# Paper Daily

**一个以个人研究任务为中心、由公开期刊 RSS 驱动的文献追踪模板。**

[在线示例](https://glacial7.github.io/paper-daily/) · [个性化设置](https://glacial7.github.io/paper-daily/customize.html) · [RSS 更新工作流](https://github.com/glacial7/paper-daily/actions/workflows/update-daily.yml)

Paper Daily 不做通用论文热榜。它先从公开期刊 RSS 建立较宽的候选池，再结合 DOI 元数据、研究主题和文献类型，整理出两层阅读队列：`日报`用于当天优先阅读的少量文献，`全部动态`保留更宽的新鲜候选，便于回看和主动检索。

公开仓库提供一套中性的通用生态学起始配置，不包含维护者的研究项目、阅读历史、订阅列表或反馈数据。Fork 后可以把研究问题、主题权重、期刊等级和 RSS 信源替换为自己的版本。

## 项目原则

- **研究任务优先：**主题相关性和元数据可信度优先于期刊名气或来源数量。
- **发现与推荐分层：**RSS 负责发现，DOI 和文章元数据负责确认论文身份、期刊和文献类型。
- **窄日报、宽动态：**日报是重点阅读队列，不等同于全部新文献；全部动态用于保留可检索的候选池。
- **配置归用户所有：**研究画像、反馈和信源都以仓库内可审查的 JSON 文件表达，静态网页不收集账户信息。
- **公开边界明确：**GitHub Pages 版只处理明确配置的公开期刊 RSS，不发布私有订阅或本地应用数据。

## 公开版包含什么

| 能力 | 说明 |
| --- | --- |
| 期刊追踪 | 从 `config/sources.json` 中明确列出的期刊 RSS 获取近 14 天条目 |
| 元数据修复 | 使用 DOI 和文章元数据校正题名、期刊、作者与文献类型 |
| 主题筛选 | 按 `config/research-profile.json` 中的研究问题和主题权重评估相关性 |
| 两层阅读队列 | 日报保留少量重点文献，全部动态展示更宽候选池 |
| 本地反馈 | 点赞/点踩保存在浏览器，可导出为配置文件，不会自动上传 |
| 静态部署 | 生成后的阅读器可直接托管在 GitHub Pages，浏览时不需要模型 API |

公开版不包含微信公众号订阅、文章和账号列表，不包含新闻聚合源、Cookie、私有模型凭据、本地缓存或 macOS 应用控制。RSS 断开时也不会用 Crossref 搜索或网页发现冒充新的订阅来源。

## 快速部署自己的版本

1. Fork 本仓库。
2. 编辑 `config/research-profile.json`，填写自己的研究问题、核心主题、支持主题、降权主题、标签和初始权重。
3. 编辑 `config/sources.json`，增删带有明确 `feedUrl` 或 `feedUrls` 的公开期刊 RSS。
4. 按需修改 `config/journal-grades.json` 中的期刊等级。
5. 在仓库 **Settings > Secrets and variables > Actions** 中添加 `DEEPSEEK_API_KEY`。
6. 运行 **Actions > Update Paper Daily (Journal RSS Only) > Run workflow**。
7. 在仓库设置中启用 GitHub Pages。

网页中的反馈可以导出为 `topic-feedback.json`。确认其中不含不希望公开的信息后，用它替换 `config/topic-feedback.json` 并再次运行更新工作流。

## 配置入口

| 文件 | 用途 | 公开前注意 |
| --- | --- | --- |
| `config/research-profile.json` | 研究问题、主题标签和优先级 | 只写愿意公开的研究方向 |
| `config/topic-feedback.json` | 导出的阅读反馈和关注列表 | 论文选择可能暴露个人兴趣，提交前检查 |
| `config/sources.json` | 公开期刊 RSS 列表 | 只使用公开 feed URL |
| `config/journal-grades.json` | 用于辅助排序的期刊等级 | 不要提交授权数据库导出 |

静态网页不能直接写回 GitHub。配置修改需要提交到自己的 Fork，并在更新工作流运行后生效。API key 只能放在 GitHub Actions Secret 中，不能写入 JSON 或代码文件。

## 页面结构

- `index.html`：窄的日报重点阅读队列；
- `updates.html`：较宽的近期候选池；
- `sources.html`：已配置的期刊 RSS 与近期条目统计；
- `customize.html`：公开模板的设置入口；
- `changelog.html`：公开版策略变更记录。

静态阅读器优先读取 `data/latest.json`，并以 `data/latest.js` 作为离线回退。

## 本地预览

需要 Node.js 20+ 和 Python 3。

```bash
npm run prepare:public
npm run verify
npm run serve
```

打开 <http://localhost:8080>。

## RSS 更新流程

GitHub Actions 工作流当前为手动触发，依次执行：

1. 从明确配置的期刊 RSS 获取近 14 天条目；
2. 进行 DOI/元数据修复和生态学相关性筛选；
3. 使用仓库配置的研究画像生成推荐；
4. 验证候选、推荐、信源配置和发布文件仍满足 RSS-only 边界；
5. 提交新的静态阅读快照。

`npm run prepare:public` 可在发布前过滤本地 Paper Daily 快照，移除非期刊来源信号、私有来源字段、非 RSS 信源和与当前候选无关的缓存。`npm run verify:rss-only` 会在发现禁用订阅文件或缺少明确期刊 RSS 信号时失败。

## 隐私与安全

不要提交 API key、`.env.local`、Cookie、微信公众号订阅数据、本地 WeRSS 数据库、私人研究材料或个人模型缓存。公开 Fork 中的研究画像、反馈和信源列表都应被视为公开信息。
