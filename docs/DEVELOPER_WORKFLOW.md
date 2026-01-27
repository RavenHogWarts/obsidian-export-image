# 开发者工作流程指南

本文档面向 `obsidian-export-image` 项目的开发者，涵盖从环境搭建到发布的完整工作流程。

---

## 目录

- [快速开始](#快速开始)
- [日常开发流程](#日常开发流程)
- [代码规范与检查](#代码规范与检查)
- [国际化开发](#国际化开发)
- [本地测试](#本地测试)
- [构建与发布](#构建与发布)
- [常用脚本命令](#常用脚本命令)
- [开发最佳实践](#开发最佳实践)

---

## 快速开始

### 1. 环境要求

- **Node.js**: 18.x 或更高版本
- **包管理器**: pnpm（推荐）
- **编辑器**: VS Code（推荐）
- **Obsidian**: 用于测试插件

### 2. 克隆项目

```bash
git clone https://github.com/RavenHogwarts/obsidian-export-image.git
cd obsidian-export-image
```

### 3. 安装依赖

```bash
pnpm install
```

### 4. 配置本地测试环境（可选）

创建 `.env` 文件并添加你的 Obsidian Vault 路径：

```env
VAULT_PATH=/path/to/your/vault/.obsidian/plugins/obsidian-export-image-fork
```

这样可以使用 `pnpm run build:local` 自动将构建产物复制到 Vault。

---

## 日常开发流程

### 标准开发循环

```
修改代码 → 保存 → 自动构建 → Obsidian 热重载 → 测试
```

### 启动开发模式

```bash
pnpm run dev
```

**功能**：
- 监听 `src/` 目录下的文件变化
- 自动使用 esbuild 重新构建 `main.js` 和 `styles.css`
- 支持增量构建，速度极快（通常 < 100ms）

**监听的文件类型**：
- TypeScript: `.ts`, `.tsx`
- JavaScript: `.js`, `.jsx`
- CSS: 由 TypeScript 中 `import './styles.css'` 引入

### 修改代码后的工作流

1. **编辑源文件**（如 `src/components/file/exportImage.tsx`）
2. **保存文件**（esbuild 自动重新构建）
3. **在 Obsidian 中重新加载插件**：
   - 打开命令面板：`Ctrl/Cmd + P`
   - 运行：`Reload app without saving`
   - 或使用快捷键重启 Obsidian
4. **测试新功能**

### 查看构建输出

构建完成后会生成以下文件：
- `main.js` - 插件主代码
- `main.js.LEGAL.txt` - 许可证信息
- `styles.css` - 样式文件

---

## 代码规范与检查

### Lint 检查

项目使用 **ESLint + XO** 进行代码质量检查。

```bash
# 运行 lint 检查
pnpm run lint

# 自动修复可修复的问题
pnpm run lint-fix
```

### 类型检查

TypeScript 类型检查在构建时自动执行：

```bash
pnpm run build
```

该命令会先运行 `tsc -noEmit -skipLibCheck` 进行类型检查。

### 编码规范要点

1. **使用 TypeScript**：所有新代码必须使用 TypeScript
2. **React Hooks 规范**：遵循 React Hooks 命名约定
3. **避免 `any` 类型**：尽可能使用具体类型或泛型
4. **文件命名**：组件文件使用大驼峰（如 `ExportImage.tsx`），工具文件使用小驼峰（如 `capture.ts`）

---

## 国际化开发

项目使用 **typesafe-i18n** 实现类型安全的国际化。

### 添加/修改翻译

1. **编辑基础语言文件**（英文）：

```bash
src/i18n/en/index.ts
```

示例：
```typescript
const en = {
  exportImage: 'Export as Image',
  save: 'Save',
  copy: 'Copy to Clipboard',
  // 添加新的翻译键
  newFeature: 'New Feature Description',
} satisfies BaseTranslation;

export default en;
```

2. **生成类型定义**：

```bash
pnpm run i18n:typesafe
```

这会自动更新 `src/i18n/i18n-types.ts`，确保类型安全。

3. **同步到其他语言**：

```bash
pnpm run i18n:sync
```

**脚本功能**：
- 自动检测英文基准文件中新增/删除的键
- 为所有其他语言文件（`zh/`, `ja/` 等）添加缺失的键
- 删除多余的键
- 保留现有翻译值（仅补充缺失的部分）

4. **手动翻译**：

编辑 `src/i18n/zh/index.ts` 等文件，为新键添加对应的翻译。

### 在代码中使用翻译

```typescript
import L from '@/i18n/L';

// 函数组件中
const MyComponent = () => {
  const t = L.get();
  return <button>{t.save()}</button>;
};

// 类中使用
L.get().exportImage();
```

---

## 本地测试

### 方法 1: 手动复制

1. **构建插件**：
   ```bash
   pnpm run build
   ```

2. **复制文件到 Vault**：
   将 `main.js`, `manifest.json`, `styles.css` 复制到：
   ```
   <YourVault>/.obsidian/plugins/obsidian-export-image-fork/
   ```

3. **在 Obsidian 中重新加载插件**

### 方法 2: 自动复制（推荐）

1. **配置 `.env` 文件**：
   ```env
   VAULT_PATH=/Users/yourname/Documents/MyVault
   ```

2. **一键构建并复制**：
   ```bash
   pnpm run build:local
   ```

**脚本执行流程**：
- 运行完整的生产构建
- 自动复制 `main.js`, `manifest.json`, `styles.css` 到指定 Vault
- 如果目标目录不存在，会自动创建

3. **重新加载 Obsidian 插件**

### 测试检查清单

- [ ] 单文件导出功能
- [ ] 选中文本导出功能
- [ ] 文件夹批量导出功能
- [ ] 各种格式导出（PNG, JPG, WebP, PDF）
- [ ] 水印和作者信息显示
- [ ] 元数据渲染
- [ ] 自定义 CSS 样式加载
- [ ] 设置页面所有选项
- [ ] 多语言切换

---

## 构建与发布

### 构建生产版本

```bash
pnpm run build
```

**执行内容**：
1. TypeScript 类型检查（不生成文件）
2. esbuild 构建并压缩代码
3. 生成 `main.js`, `styles.css`, `main.js.LEGAL.txt`

### 版本发布流程

#### 1. 更新版本号

运行交互式版本升级脚本：

```bash
pnpm run release
```

**脚本功能**：
- 交互式选择版本类型（major / minor / patch / beta）
- 自动更新 `package.json`
- 自动更新 `manifest.json` 和 `manifest-beta.json`
- 自动更新 `versions.json`（记录版本兼容性）
- 运行 `pnpm install` 更新 `pnpm-lock.yaml`

**版本类型说明**：
- **patch**: 修复 bug（如 `1.0.0` → `1.0.1`）
- **minor**: 新增功能（如 `1.0.0` → `1.1.0`）
- **major**: 重大更新（如 `1.0.0` → `2.0.0`）
- **beta**: Beta 测试版（如 `1.0.0` → `1.0.1-beta.1`）

#### 2. 提交更改

```bash
git add .
git commit -m "chore: bump version to X.Y.Z"
```

#### 3. 创建 Git Tag

```bash
git tag -a X.Y.Z -m "Release X.Y.Z"
```

#### 4. 推送到远程仓库

```bash
git push origin main
git push origin X.Y.Z
```

#### 5. GitHub Actions 自动发布

推送 tag 后，GitHub Actions 会自动：
- 运行构建
- 创建 GitHub Release
- 上传 `main.js`, `manifest.json`, `styles.css` 作为附件

---

## 常用脚本命令

| 命令                     | 功能                        | 使用场景             |
| ------------------------ | --------------------------- | -------------------- |
| `pnpm run dev`           | 开发模式（监听文件变化）    | 日常开发             |
| `pnpm run build`         | 生产构建                    | 发布前构建           |
| `pnpm run build:local`   | 构建并复制到本地 Vault      | 本地测试             |
| `pnpm run release`       | 版本升级（交互式）          | 发布新版本           |
| `pnpm run lint`          | 代码检查                    | 提交前检查           |
| `pnpm run lint-fix`      | 自动修复 lint 问题          | 快速修复格式问题     |
| `pnpm run i18n:typesafe` | 生成 i18n 类型定义          | 修改英文翻译后       |
| `pnpm run i18n:sync`     | 同步翻译键到所有语言        | 添加新翻译键后       |
| `pnpm run link:data`     | 软链接 `data.json` 到 Vault | 开发时测试数据持久化 |

---

## 开发最佳实践

### 1. 分支管理

- **main**: 稳定版本分支
- **dev**: 开发分支
- **feature/xxx**: 功能分支
- **fix/xxx**: 修复分支

### 2. 提交信息规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/)：

```
feat: 添加 PDF 导出功能
fix: 修复水印在高分辨率下显示异常
docs: 更新开发文档
chore: 升级依赖版本
refactor: 重构导出逻辑
```

### 3. 添加新功能的步骤

1. **更新类型定义**（`src/types/settings.ts`）
2. **添加默认设置**（`src/settings/settingSchema.ts`）
3. **实现核心逻辑**（`src/components/` 或 `src/utils/`）
4. **添加 UI 配置**（`src/settings/SettingPage.tsx`）
5. **添加国际化**（`src/i18n/en/index.ts` → 运行 `i18n:typesafe` → `i18n:sync`）
6. **编写测试用例**（如有测试框架）
7. **更新文档**（`docs/DEVELOPMENT.md`）

### 4. 性能优化建议

- **React 组件优化**：使用 `React.memo`, `useMemo`, `useCallback`
- **避免不必要的重渲染**：合理使用状态管理
- **异步加载大资源**：避免阻塞主线程
- **图片处理**：使用 Web Workers（如果需要）

### 5. 调试技巧

#### 在 Obsidian 中调试

1. 打开开发者工具：`Ctrl/Cmd + Shift + I`
2. 使用 `console.log()` 输出调试信息
3. 在 Sources 面板设置断点

#### 调试构建问题

临时禁用代码压缩（`scripts/esbuild.config.mjs`）：

```javascript
minify: false,
```

#### 查看导出 HTML 结构

在 `src/utils/makeHTML.tsx` 中添加：

```typescript
console.log('Generated HTML:', htmlString);
```

### 6. 常见问题排查

| 问题             | 可能原因                | 解决方案                                       |
| ---------------- | ----------------------- | ---------------------------------------------- |
| 修改代码后无变化 | Obsidian 未重新加载插件 | 运行 `Reload app without saving`               |
| 类型错误         | TypeScript 版本不匹配   | 运行 `pnpm install`                            |
| 翻译未生效       | 未运行 `i18n:typesafe`  | 运行 `pnpm run i18n:typesafe`                  |
| 构建失败         | 依赖版本冲突            | 删除 `node_modules` 重新安装                   |
| 样式未应用       | CSS 文件未正确重命名    | 检查 `esbuild.config.mjs` 的 `cssOutputPlugin` |

---

## 项目技术架构

### 核心技术栈

| 技术              | 版本   | 用途       |
| ----------------- | ------ | ---------- |
| TypeScript        | 5.7.2  | 主语言     |
| React             | 19.0.0 | UI 框架    |
| esbuild           | 0.25.0 | 构建工具   |
| dom-to-image-more | 3.5.0  | DOM 转图片 |
| jspdf             | 2.5.2  | PDF 生成   |
| typesafe-i18n     | 5.26.2 | 国际化     |

### 构建流程图

```
┌─────────────┐
│  main.ts    │ (入口文件)
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│ src/ExportImagePlugin.ts │ (插件主类)
└───────────┬─────────────┘
            │
            ├─→ 注册命令 (Command Palette)
            ├─→ 注册菜单 (Editor Menu)
            └─→ 加载设置页面 (Settings Tab)
                    │
                    ▼
      ┌──────────────────────────┐
      │ src/components/          │
      │ ├─ file/exportImage.tsx  │ (单文件导出)
      │ └─ folder/exportFolder   │ (批量导出)
      └────────────┬─────────────┘
                   │
                   ▼
      ┌─────────────────────────┐
      │ src/utils/capture.ts    │ (核心截图逻辑)
      └────────────┬────────────┘
                   │
                   ├─→ dom-to-image-more (生成 Blob)
                   ├─→ file-saver (保存文件)
                   └─→ jspdf (生成 PDF)
```

---

## 相关文档

- [DEVELOPMENT.md](./DEVELOPMENT.md) - 详细开发文档
- [CUSTOM_CSS_IMPLEMENTATION.md](./CUSTOM_CSS_IMPLEMENTATION.md) - 自定义 CSS 实现
- [README.md](../README.md) - 项目介绍

---

## 贡献须知

1. **Fork 仓库**并创建你的功能分支
2. **遵循代码规范**（运行 `pnpm run lint`）
3. **更新相关文档**（如有必要）
4. **编写清晰的提交信息**
5. **提交 Pull Request**

---

**欢迎贡献！** 如有疑问，请提交 [Issue](https://github.com/RavenHogwarts/obsidian-export-image/issues)。

---

*最后更新: 2026-01-27*
