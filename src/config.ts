import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 配置文件接口
 */
export interface TestIdConfig {
  attributeKeyword: string;
  ignoreElements: string[];
  onlyElements?: string[];
  defaultTestId: string;
}

/**
 * 读取项目根目录的 .testidrc.json 配置文件
 */
export function loadConfigFromFile(workspaceFolder?: vscode.WorkspaceFolder): TestIdConfig | null {
  if (!workspaceFolder) {
    return null;
  }

  try {
    // 安全地获取工作区 URI 的文件系统路径
    const workspaceUri = workspaceFolder.uri;
    if (!workspaceUri || !workspaceUri.fsPath) {
      return null;
    }

    const configPath = path.join(workspaceUri.fsPath, '.testidrc.json');
    
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf-8');
      const config = JSON.parse(configContent) as Partial<TestIdConfig>;
      
      return {
        attributeKeyword: config.attributeKeyword || 'data-test-id',
        ignoreElements: config.ignoreElements || [],
        onlyElements: config.onlyElements,
        defaultTestId: config.defaultTestId || 'test',
      };
    }
  } catch (error) {
    // 静默处理错误，避免在没有工作区时抛出异常
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn('读取配置文件失败（这可能是正常的，如果文件不在工作区中）:', errorMessage);
  }
  
  return null;
}

/**
 * 获取合并后的配置（文件配置 + VS Code 设置）
 */
export function getMergedConfig(workspaceFolder?: vscode.WorkspaceFolder): TestIdConfig {
  let fileConfig: TestIdConfig | null = null;
  
  try {
    fileConfig = loadConfigFromFile(workspaceFolder);
  } catch (error) {
    // 如果加载文件配置失败，继续使用 VS Code 配置
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn('获取文件配置时出错，将使用 VS Code 默认配置:', errorMessage);
  }
  
  // 安全地获取 VS Code 配置（处理没有工作区的情况）
  let vscodeConfig: vscode.WorkspaceConfiguration;
  try {
    // 如果没有工作区文件夹，使用 null 作为作用域（将使用全局配置）
    const configScope = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
      ? vscode.workspace.workspaceFolders[0]
      : null;
    
    vscodeConfig = vscode.workspace.getConfiguration('testid', configScope);
  } catch (error) {
    // 如果获取配置失败，使用默认值
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn('获取 VS Code 配置时出错，使用默认配置:', errorMessage);
    // 返回默认配置
    return {
      attributeKeyword: fileConfig?.attributeKeyword || 'data-test-id',
      ignoreElements: fileConfig?.ignoreElements || [],
      onlyElements: fileConfig?.onlyElements || [],
      defaultTestId: fileConfig?.defaultTestId || 'test',
    };
  }
  
  return {
    attributeKeyword: fileConfig?.attributeKeyword || vscodeConfig.get<string>('attributeKeyword', 'data-test-id'),
    ignoreElements: fileConfig?.ignoreElements || vscodeConfig.get<string[]>('ignoreElements', []),
    onlyElements: fileConfig?.onlyElements || vscodeConfig.get<string[]>('onlyElements', []),
    defaultTestId: fileConfig?.defaultTestId || vscodeConfig.get<string>('defaultTestId', 'test'),
  };
}

/**
 * 检查标签是否应该被处理
 */
export function shouldProcessTag(tagName: string, config: TestIdConfig): boolean {
  // 如果设置了 onlyElements，只处理列表中的标签
  if (config.onlyElements && config.onlyElements.length > 0) {
    return config.onlyElements.includes(tagName);
  }
  
  // 如果标签在忽略列表中，不处理
  if (config.ignoreElements.includes(tagName)) {
    return false;
  }
  
  return true;
}

