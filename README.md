# Test ID Generator

一个 VS Code/Cursor 扩展，用于快速为 JSX/TSX/HTML 标签生成 `data-test-id` 属性。

## 功能特性

- ✅ **快捷键支持**：通过快捷键快速为选中标签或所有标签添加 Test ID
- ✅ **配置文件支持**：支持通过 `.testidrc.json` 配置文件自定义行为
- ✅ **标签过滤**：可以设置忽略某些标签，或仅处理指定的标签
- ✅ **智能识别**：自动识别 JSX/TSX 组件和 HTML 标签
- ✅ **避免重复**：如果标签已有 Test ID，会更新而不是重复添加

## 安装方法

### 方法一：本地开发安装

1. 克隆或下载此扩展代码
2. 在扩展目录下运行：
   ```bash
   npm install
   npm run compile
   ```
3. 在 VS Code/Cursor 中按 `F5` 启动扩展开发宿主
4. 或者使用 `vsce package` 打包后安装

### 方法二：从源码安装

```bash
cd vscode-extension-testid
npm install
npm run compile
code --install-extension *.vsix
```

## 使用方法

### 快捷键

- **为选中标签添加 Test ID**：
  - Windows/Linux: `Ctrl+Shift+T`
  - macOS: `Cmd+Shift+T`

- **为所有标签添加 Test ID**：
  - Windows/Linux: `Ctrl+Alt+T`
  - macOS: `Cmd+Alt+T`

### 命令面板

1. 按 `Ctrl+Shift+P` (macOS: `Cmd+Shift+P`) 打开命令面板
2. 输入以下命令：
   - `为选中标签添加 Test ID`
   - `为所有标签添加 Test ID`

## 配置

### 项目配置文件（推荐）

在项目根目录创建 `.testidrc.json` 文件：

```json
{
  "attributeKeyword": "data-test-id",
  "ignoreElements": [
    "template",
    "script",
    "style",
    "body",
    "head",
    "html",
    "Fragment",
    "React.Fragment",
    "Suspense",
    "Portal"
  ],
  "onlyElements": [],
  "defaultTestId": "test"
}
```

**配置说明：**

- `attributeKeyword`: Test ID 属性名称，默认为 `data-test-id`
- `ignoreElements`: 忽略的元素标签列表，这些标签不会被处理
- `onlyElements`: 仅处理的元素标签列表（可选）。如果设置，则只处理列表中的标签，忽略其他所有标签
- `defaultTestId`: 默认的 Test ID 后缀，默认为 `test`

**注意：** `ignoreElements` 和 `onlyElements` 不能同时生效。如果设置了 `onlyElements`，则 `ignoreElements` 会被忽略。

### VS Code 设置

也可以在 VS Code 设置中配置（会覆盖配置文件）：

```json
{
  "testid.attributeKeyword": "data-test-id",
  "testid.defaultTestId": "test",
  "testid.ignoreElements": ["template", "script"],
  "testid.onlyElements": []
}
```

## 使用示例

### 示例 1：为选中标签添加 Test ID

**操作前：**
```tsx
<div>
  <button onClick={handleClick}>点击</button>
</div>
```

选中 `<button>` 标签，按 `Ctrl+Shift+T` (macOS: `Cmd+Shift+T`)

**操作后：**
```tsx
<div>
  <button data-test-id="button-test" onClick={handleClick}>点击</button>
</div>
```

### 示例 2：为所有标签添加 Test ID

**操作前：**
```tsx
<div>
  <h1>标题</h1>
  <p>内容</p>
  <button>按钮</button>
</div>
```

按 `Ctrl+Alt+T` (macOS: `Cmd+Alt+T`)

**操作后：**
```tsx
<div data-test-id="div-test">
  <h1 data-test-id="h1-test">标题</h1>
  <p data-test-id="p-test">内容</p>
  <button data-test-id="button-test">按钮</button>
</div>
```

### 示例 3：使用 onlyElements 配置

`.testidrc.json`:
```json
{
  "attributeKeyword": "data-test-id",
  "onlyElements": ["button", "input", "select"],
  "defaultTestId": "test"
}
```

**操作前：**
```tsx
<div>
  <h1>标题</h1>
  <button>按钮</button>
  <input type="text" />
  <p>内容</p>
</div>
```

**操作后（只处理 button 和 input）：**
```tsx
<div>
  <h1>标题</h1>
  <button data-test-id="button-test">按钮</button>
  <input data-test-id="input-test" type="text" />
  <p>内容</p>
</div>
```

## 注意事项

1. **已存在的 Test ID**：如果标签已经有 Test ID 属性，扩展会更新它而不是添加新的
2. **自闭合标签**：支持自闭合标签，如 `<img />`、`<input />` 等
3. **JSX 组件**：支持 React 组件（大写开头）和 HTML 标签（小写开头）
4. **配置文件优先级**：项目根目录的 `.testidrc.json` 优先级高于 VS Code 设置

## 常见问题

### 控制台中的警告和错误

如果看到以下警告或错误，**可以安全忽略**，它们不影响扩展功能：

1. **punycode 弃用警告**：
   ```
   (node:xxxx) [DEP0040] DeprecationWarning: The `punycode` module is deprecated.
   ```
   - 这是 Node.js 的已知弃用警告，来自 VS Code 扩展主机进程
   - 扩展代码已尝试抑制此警告，但如果警告在扩展加载前触发，可能仍会显示
   - **不影响扩展功能**，可以安全忽略

2. **NoWorkspaceUriError 错误**：
   ```
   repoResult.error NoWorkspaceUriError
   ```
   - 当文件不在工作区中打开时可能出现
   - 扩展已添加完善的错误处理，会自动处理这种情况
   - **不影响扩展功能**，扩展可以在没有工作区的情况下正常工作

更多故障排除信息，请查看项目中的 TROUBLESHOOTING.md 文件

## 开发

### 构建

```bash
npm install
npm run compile
```

### 调试和测试

1. 在 VS Code/Cursor 中打开扩展目录
2. 按 `F5` 启动扩展开发宿主
3. 在新窗口中测试扩展功能

**详细测试指南请查看项目中的 TESTING.md 文件**

快速测试：
- 打开项目中的 `test-example.tsx` 文件
- 使用快捷键或命令面板测试扩展功能

### 打包

```bash
npm install -g vsce
vsce package
```

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！

