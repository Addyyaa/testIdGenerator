# 测试指南

## 快速开始

### 1. 编译扩展

首先确保代码已编译：

```bash
npm run compile
```

或者使用 watch 模式（自动编译）：

```bash
npm run watch
```

### 2. 启动扩展开发宿主

有两种方式启动扩展进行测试：

#### 方法一：使用 F5（推荐）

1. 在 VS Code/Cursor 中打开扩展项目目录
2. 按 `F5` 键，或者：
   - 点击左侧调试面板（🐛）
   - 选择 "运行扩展" 配置
   - 点击绿色播放按钮

3. 会打开一个新的扩展开发宿主窗口（Extension Development Host）
4. 在新窗口中测试扩展功能

#### 方法二：使用命令面板

1. 按 `Ctrl+Shift+P` (macOS: `Cmd+Shift+P`) 打开命令面板
2. 输入 `Debug: Start Debugging`
3. 选择 "运行扩展"

### 3. 测试扩展功能

在新打开的扩展开发宿主窗口中：

1. 创建一个测试文件（`.tsx`、`.jsx`、`.ts`、`.js` 或 `.html`）
2. 测试扩展的各种功能

## 测试用例

### 测试用例 1：为选中标签添加 Test ID

**测试步骤：**

1. 创建一个新文件 `test.tsx`
2. 输入以下代码：
```tsx
function App() {
  return (
    <div>
      <button onClick={() => {}}>点击我</button>
      <p>这是一段文字</p>
    </div>
  );
}
```

3. 选中 `<button>` 标签（包括标签本身）
4. 按快捷键：
   - macOS: `Cmd+Shift+T`
   - Windows/Linux: `Ctrl+Shift+T`
5. 或者使用命令面板：`为选中标签添加 Test ID`

**预期结果：**
```tsx
function App() {
  return (
    <div>
      <button data-test-id="button-test" onClick={() => {}}>点击我</button>
      <p>这是一段文字</p>
    </div>
  );
}
```

### 测试用例 2：为所有标签添加 Test ID

**测试步骤：**

1. 使用上面的 `test.tsx` 文件
2. 按快捷键：
   - macOS: `Cmd+Alt+T`
   - Windows/Linux: `Ctrl+Alt+T`
3. 或者使用命令面板：`为所有标签添加 Test ID`
4. 确认操作对话框，点击"确定"

**预期结果：**
```tsx
function App() {
  return (
    <div data-test-id="div-test">
      <button data-test-id="button-test" onClick={() => {}}>点击我</button>
      <p data-test-id="p-test">这是一段文字</p>
    </div>
  );
}
```

### 测试用例 3：测试配置文件

**测试步骤：**

1. 在项目根目录创建 `.testidrc.json`：
```json
{
  "attributeKeyword": "data-test-id",
  "ignoreElements": ["div", "span"],
  "defaultTestId": "my-test"
}
```

2. 创建一个测试文件：
```tsx
<div>
  <button>按钮</button>
  <span>文本</span>
</div>
```

3. 使用"为所有标签添加 Test ID"命令

**预期结果：**
- `div` 和 `span` 被忽略（因为配置了 `ignoreElements`）
- 只有 `button` 添加了 Test ID：
```tsx
<div>
  <button data-test-id="button-my-test">按钮</button>
  <span>文本</span>
</div>
```

### 测试用例 4：测试 onlyElements 配置

**测试步骤：**

1. 创建 `.testidrc.json`：
```json
{
  "attributeKeyword": "data-test-id",
  "onlyElements": ["button", "input"],
  "defaultTestId": "test"
}
```

2. 创建测试文件：
```tsx
<div>
  <h1>标题</h1>
  <button>按钮</button>
  <input type="text" />
  <p>段落</p>
</div>
```

3. 使用"为所有标签添加 Test ID"命令

**预期结果：**
- 只有 `button` 和 `input` 添加了 Test ID：
```tsx
<div>
  <h1>标题</h1>
  <button data-test-id="button-test">按钮</button>
  <input data-test-id="input-test" type="text" />
  <p>段落</p>
</div>
```

### 测试用例 5：测试已存在的 Test ID

**测试步骤：**

1. 创建测试文件：
```tsx
<button data-test-id="existing-id">按钮</button>
```

2. 选中整个标签，使用"为选中标签添加 Test ID"命令

**预期结果：**
- Test ID 被更新为新的值：
```tsx
<button data-test-id="button-test">按钮</button>
```

### 测试用例 6：测试自闭合标签

**测试步骤：**

1. 创建测试文件：
```tsx
<img src="image.jpg" />
<input type="text" />
<br />
```

2. 使用"为所有标签添加 Test ID"命令

**预期结果：**
```tsx
<img data-test-id="img-test" src="image.jpg" />
<input data-test-id="input-test" type="text" />
<br data-test-id="br-test" />
```

### 测试用例 7：测试 React 组件

**测试步骤：**

1. 创建测试文件：
```tsx
import React from 'react';

function MyComponent() {
  return (
    <div>
      <Button>点击</Button>
      <CustomInput />
    </div>
  );
}
```

2. 使用"为所有标签添加 Test ID"命令

**预期结果：**
```tsx
import React from 'react';

function MyComponent() {
  return (
    <div data-test-id="div-test">
      <Button data-test-id="Button-test">点击</Button>
      <CustomInput data-test-id="CustomInput-test" />
    </div>
  );
}
```

### 测试用例 8：测试没有工作区的情况

**测试步骤：**

1. 在扩展开发宿主窗口中，不要打开任何文件夹
2. 直接创建一个新文件（Untitled）
3. 输入一些 JSX 代码
4. 测试扩展功能

**预期结果：**
- 扩展应该正常工作，使用全局配置
- 不应该出现错误（虽然有 NoWorkspaceUriError 警告，但不影响功能）

## 调试技巧

### 查看扩展日志

1. 在扩展开发宿主窗口中，打开输出面板：
   - `View` -> `Output`
   - 或按 `Ctrl+Shift+U` (macOS: `Cmd+Shift+U`)

2. 在下拉菜单中选择 "Log (Extension Host)"

3. 查看扩展的输出日志，包括：
   - "Test ID Generator 扩展已激活"
   - 任何错误或警告信息

### 设置断点

1. 在源代码中设置断点（点击行号左侧）
2. 在扩展开发宿主窗口中执行命令
3. 调试器会在断点处暂停
4. 可以查看变量值、调用栈等

### 重新加载扩展

修改代码后：

1. 停止当前的调试会话（点击停止按钮）
2. 重新编译（如果使用 watch 模式会自动编译）
3. 再次按 `F5` 启动

或者：

1. 在扩展开发宿主窗口中按 `Ctrl+R` (macOS: `Cmd+R`) 重新加载窗口
2. 扩展会自动重新加载

## 常见问题

### Q: 扩展没有激活？

**A:** 检查以下几点：
1. 确保文件语言是支持的类型（`.tsx`、`.jsx`、`.ts`、`.js`、`.html`）
2. 查看输出面板的日志
3. 检查 `package.json` 中的 `activationEvents` 配置

### Q: 快捷键不工作？

**A:** 
1. 确保编辑器有焦点（不是只读模式）
2. 检查快捷键是否被其他扩展占用
3. 尝试使用命令面板执行命令

### Q: 如何测试配置文件？

**A:**
1. 在扩展开发宿主窗口中打开一个文件夹作为工作区
2. 在工作区根目录创建 `.testidrc.json`
3. 重新加载窗口使配置生效

### Q: 如何测试 VS Code 设置？

**A:**
1. 在扩展开发宿主窗口中打开设置
2. 搜索 "testid"
3. 修改相关设置
4. 测试扩展功能

## 自动化测试（可选）

如果需要编写自动化测试，可以：

1. 安装测试框架：
```bash
npm install --save-dev @types/mocha mocha vscode-test
```

2. 创建测试文件（例如 `src/test/suite/extension.test.ts`）

3. 运行测试：
```bash
npm test
```

## 测试清单

- [ ] 为选中标签添加 Test ID（快捷键）
- [ ] 为选中标签添加 Test ID（命令面板）
- [ ] 为所有标签添加 Test ID（快捷键）
- [ ] 为所有标签添加 Test ID（命令面板）
- [ ] 测试配置文件（`.testidrc.json`）
- [ ] 测试 VS Code 设置
- [ ] 测试 `ignoreElements` 配置
- [ ] 测试 `onlyElements` 配置
- [ ] 测试已存在的 Test ID（更新而不是重复）
- [ ] 测试自闭合标签
- [ ] 测试 React 组件（大写开头）
- [ ] 测试 HTML 标签（小写开头）
- [ ] 测试没有工作区的情况
- [ ] 测试空选择的情况
- [ ] 测试没有标签的文本

