# 安装指南

## 快速开始

### 1. 安装依赖

```bash
cd vscode-extension-testid
npm install
```

### 2. 编译扩展

```bash
npm run compile
```

### 3. 安装扩展

#### 方法 A：开发模式运行（推荐用于测试）

1. 在 VS Code/Cursor 中打开 `vscode-extension-testid` 目录
2. 按 `F5` 启动扩展开发宿主
3. 在新窗口中测试扩展功能

#### 方法 B：打包安装

**选项 1：使用 npx（推荐，无需全局安装）**

```bash
# 使用 npx 直接运行 vsce，无需全局安装
npx -y @vscode/vsce package

# 安装打包后的扩展
code --install-extension testid-generator-1.0.0.vsix
```

**选项 2：本地安装 vsce（推荐）**

```bash
# 在扩展目录下本地安装 vsce
npm install --save-dev @vscode/vsce

# 使用本地安装的 vsce
npx vsce package

# 或添加到 package.json 的 scripts 中
# 然后运行: npm run package
```

**选项 3：使用 sudo（macOS/Linux，不推荐）**

```bash
# 使用管理员权限全局安装
sudo npm install -g @vscode/vsce

# 打包扩展
vsce package

# 安装打包后的扩展
code --install-extension testid-generator-1.0.0.vsix
```

**选项 4：修复 npm 权限（推荐长期解决方案）**

```bash
# 创建全局包目录
mkdir ~/.npm-global

# 配置 npm 使用新目录
npm config set prefix '~/.npm-global'

# 添加到 PATH（添加到 ~/.zshrc 或 ~/.bash_profile）
export PATH=~/.npm-global/bin:$PATH

# 重新加载配置
source ~/.zshrc  # 或 source ~/.bash_profile

# 现在可以正常全局安装
npm install -g @vscode/vsce
```

## 验证安装

1. 打开任意 JSX/TSX/HTML 文件
2. 选中一个标签，按 `Ctrl+Shift+T` (macOS: `Cmd+Shift+T`)
3. 如果标签被添加了 `data-test-id` 属性，说明安装成功

## 配置

在项目根目录创建 `.testidrc.json` 文件（可选）：

```json
{
  "attributeKeyword": "data-test-id",
  "ignoreElements": ["template", "script", "style"],
  "defaultTestId": "test"
}
```

## 快捷键

- **为选中标签添加 Test ID**：
  - Windows/Linux: `Ctrl+Shift+T`
  - macOS: `Cmd+Shift+T`

- **为所有标签添加 Test ID**：
  - Windows/Linux: `Ctrl+Alt+T`
  - macOS: `Cmd+Alt+T`

## 故障排除

### npm 全局安装权限错误（EACCES）

如果遇到 `EACCES: permission denied` 错误：

1. **推荐方案**：使用 `npx` 或本地安装（见上面的方法 B）
2. **临时方案**：使用 `sudo npm install -g`（不推荐，有安全风险）
3. **长期方案**：配置 npm 使用用户目录（见上面的选项 4）

### 扩展无法激活

- 确保已安装所有依赖：`npm install`
- 确保已编译：`npm run compile`
- 检查 VS Code 版本是否 >= 1.74.0

### 快捷键不工作

- 检查快捷键是否与其他扩展冲突
- 在命令面板中手动运行命令测试功能

### 配置文件不生效

- 确保 `.testidrc.json` 在项目根目录
- 检查 JSON 格式是否正确
- 重启 VS Code/Cursor

