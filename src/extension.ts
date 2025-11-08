// 必须在所有导入之前设置警告抑制，以确保最早生效
// 抑制 punycode 弃用警告（这是 Node.js 依赖项的问题，不影响功能）
(function suppressPunycodeWarning() {
  if (typeof process === 'undefined') return;
  
  // 方法1: 拦截 process.emitWarning
  const originalEmitWarning = process.emitWarning;
  if (originalEmitWarning) {
    (process as any).emitWarning = function(warning: any, typeOrOptions?: any, code?: string, ctor?: Function) {
      // 检查是否是 punycode 相关的警告
      const warningCode = code || (typeof typeOrOptions === 'object' ? typeOrOptions?.code : undefined);
      const message = typeof warning === 'string' ? warning : (warning?.message || '');
      
      if (warningCode === 'DEP0040' || 
          (typeof warning === 'string' && warning.includes('punycode')) ||
          (warning?.message && warning.message.includes('punycode')) ||
          message.includes('punycode')) {
        // 静默忽略 punycode 警告
        return;
      }
      
      // 其他警告正常处理
      if (typeof typeOrOptions === 'object') {
        return originalEmitWarning.call(process, warning, typeOrOptions);
      } else if (code !== undefined && ctor !== undefined) {
        // 使用 apply 来处理多个参数的情况
        return (originalEmitWarning as any).apply(process, [warning, typeOrOptions, code, ctor]);
      } else if (code !== undefined) {
        return (originalEmitWarning as any).call(process, warning, typeOrOptions, code);
      } else {
        return originalEmitWarning.call(process, warning, typeOrOptions);
      }
    };
  }
  
  // 方法2: 使用 warning 事件监听器（作为备用）
  if (typeof process.on === 'function') {
    // 添加我们的过滤器作为第一个监听器
    if (typeof process.prependOnceListener === 'function') {
      process.prependOnceListener('warning', function(warning: any) {
        if (warning.code === 'DEP0040' || 
            (warning.message && warning.message.includes('punycode'))) {
          // 静默忽略
          return;
        }
      });
    } else if (typeof process.prependListener === 'function') {
      process.prependListener('warning', function(warning: any) {
        if (warning.code === 'DEP0040' || 
            (warning.message && warning.message.includes('punycode'))) {
          return;
        }
      });
    } else {
      // 如果都不存在，使用普通监听器
      process.on('warning', function(warning: any) {
        if (warning.code === 'DEP0040' || 
            (warning.message && warning.message.includes('punycode'))) {
          return;
        }
      });
    }
  }
})();

import * as vscode from 'vscode';
import { getMergedConfig, shouldProcessTag } from './config';
import { parseTags, addTestIdToTag, TagInfo } from './tagParser';

/**
 * 安全地获取工作区文件夹
 */
function getWorkspaceFolderSafely(documentUri: vscode.Uri): vscode.WorkspaceFolder | undefined {
  try {
    // 首先检查是否有工作区文件夹
    if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
      return undefined;
    }
    
    // 检查 URI 是否有效
    if (!documentUri || !documentUri.scheme) {
      return undefined;
    }
    
    // 尝试获取工作区文件夹
    const folder = vscode.workspace.getWorkspaceFolder(documentUri);
    return folder;
  } catch (error) {
    // 捕获所有可能的错误（包括 NoWorkspaceUriError）
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : '';
    
    // 静默处理工作区相关的错误，这是正常情况（文件不在工作区中）
    if (errorName === 'NoWorkspaceUriError' || 
        errorMessage.includes('NoWorkspaceUriError') || 
        errorMessage.includes('workspace')) {
      return undefined;
    }
    
    // 其他错误才记录警告
    console.warn('获取工作区文件夹时出错:', errorMessage);
    return undefined;
  }
}

function buildTestIdCounts(tags: TagInfo[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const tag of tags) {
    if (tag.testIdValue) {
      counts.set(tag.testIdValue, (counts.get(tag.testIdValue) ?? 0) + 1);
    }
  }
  return counts;
}

function decrementTestIdCount(testIdValue: string | undefined, counts: Map<string, number>): void {
  if (!testIdValue) {
    return;
  }
  const current = counts.get(testIdValue);
  if (current === undefined) {
    return;
  }
  if (current <= 1) {
    counts.delete(testIdValue);
  } else {
    counts.set(testIdValue, current - 1);
  }
}

function findTagAtOffset(tags: TagInfo[], offset: number): TagInfo | undefined {
  return tags.find((tag) => offset >= tag.startPos && offset <= tag.endPos);
}

/**
 * 激活扩展
 */
export function activate(context: vscode.ExtensionContext) {
  // 添加全局错误处理，捕获可能来自 VS Code 内部的错误
  // 这些错误来自 extensionHostProcess.js，在扩展加载之前就触发了
  // 我们无法完全阻止它们，但可以确保它们不影响扩展功能
  
  try {
    // 尝试拦截 console.error（如果可能）
    const originalConsoleError = console.error;
    console.error = function (...args: any[]) {
      // 过滤掉 NoWorkspaceUriError 相关的错误输出
      const errorString = args.join(' ');
      if (errorString.includes('NoWorkspaceUriError') || 
          errorString.includes('repoResult.error') ||
          errorString.includes('extensionHostProcess.js')) {
        // 静默处理这些错误，它们不影响扩展功能
        // 这些错误来自 VS Code 内部，不是我们的代码问题
        return;
      }
      // 其他错误正常输出
      return originalConsoleError.apply(console, args);
    };
  } catch (e) {
    // 如果拦截失败，继续执行（不影响扩展功能）
  }

  // 添加未捕获的异常处理（作为最后的安全网）
  if (typeof process !== 'undefined' && process.on) {
    process.on('uncaughtException', (error: Error) => {
      // 忽略工作区相关的错误
      if (error.name === 'NoWorkspaceUriError' || 
          error.message.includes('NoWorkspaceUriError') ||
          error.message.includes('repoResult.error')) {
        // 静默处理，这些错误不影响扩展功能
        return;
      }
      // 其他未捕获的异常才记录
      console.error('未捕获的异常:', error);
    });
  }

  console.log('Test ID Generator 扩展已激活');

  // 命令：为选中标签添加 Test ID
  const addToSelectionCommand = vscode.commands.registerCommand(
    'testid.addToSelection',
    async () => {
      try {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showWarningMessage('请先打开一个文件');
          return;
        }

        const document = editor.document;
        const selection = editor.selection;

        // 获取配置（安全地处理没有工作区的情况）
        const workspaceFolder = getWorkspaceFolderSafely(document.uri);
        const config = getMergedConfig(workspaceFolder);

        const documentText = document.getText();
        const allTags = parseTags(documentText, config);

        if (allTags.length === 0) {
          vscode.window.showInformationMessage('当前文档中没有找到可处理的标签');
          return;
        }

        const testIdCounts = buildTestIdCounts(allTags);
        const selectionText = selection.isEmpty ? '' : document.getText(selection);
        const hasNonEmptySelection = !selection.isEmpty && selectionText.trim().length > 0;

        if (!hasNonEmptySelection) {
          // 光标模式：自动定位当前行（或光标位置）的标签
          const cursorOffset = document.offsetAt(selection.active);
          const targetTag = findTagAtOffset(allTags, cursorOffset);

          if (!targetTag) {
            vscode.window.showInformationMessage('光标所在位置未找到可处理的标签');
            return;
          }

          if (!shouldProcessTag(targetTag.tagName, config)) {
            vscode.window.showInformationMessage('光标所在标签已被忽略或不在处理范围内');
            return;
          }

          decrementTestIdCount(targetTag.testIdValue, testIdCounts);
          const newTag = addTestIdToTag(targetTag, config, testIdCounts);

          const range = new vscode.Range(
            document.positionAt(targetTag.startPos),
            document.positionAt(targetTag.endPos)
          );

          await editor.edit((editBuilder) => {
            editBuilder.replace(range, newTag);
          });

          vscode.window.showInformationMessage('已为 1 个标签添加 Test ID');
          return;
        }

        const selectionStartOffset = document.offsetAt(selection.start);
        const selectionEndOffset = document.offsetAt(selection.end);

        const tagsInSelection = allTags.filter(
          (tag) => tag.startPos >= selectionStartOffset && tag.endPos <= selectionEndOffset
        );

        if (tagsInSelection.length === 0) {
          vscode.window.showInformationMessage('选中的范围中没有找到完整的标签');
          return;
        }

        const tagsToProcess = tagsInSelection.filter((tag) => shouldProcessTag(tag.tagName, config));

        if (tagsToProcess.length === 0) {
          vscode.window.showInformationMessage('选中的范围中没有需要处理的标签');
          return;
        }

        let processedText = selectionText;
        const sortedTags = [...tagsToProcess].sort((a, b) => b.startPos - a.startPos);

        for (const tag of sortedTags) {
          const relativeStart = tag.startPos - selectionStartOffset;
          const relativeEnd = tag.endPos - selectionStartOffset;

          decrementTestIdCount(tag.testIdValue, testIdCounts);
          const newTag = addTestIdToTag(tag, config, testIdCounts);

          const before = processedText.substring(0, relativeStart);
          const after = processedText.substring(relativeEnd);
          processedText = before + newTag + after;
        }

        await editor.edit((editBuilder) => {
          editBuilder.replace(selection, processedText);
        });

        vscode.window.showInformationMessage(`已为 ${tagsToProcess.length} 个标签添加 Test ID`);
      } catch (error) {
        // 捕获所有可能的错误，包括来自 VS Code 内部的错误
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorName = error instanceof Error ? error.name : '';
        
        // 静默处理工作区相关的错误
        if (errorName === 'NoWorkspaceUriError' || 
            errorMessage.includes('NoWorkspaceUriError') ||
            errorMessage.includes('repoResult.error')) {
          // 这些错误不影响功能，静默处理
          return;
        }
        
        // 其他错误显示给用户
        console.error('执行命令时出错:', errorMessage);
        vscode.window.showErrorMessage(`执行命令时出错: ${errorMessage}`);
      }
    }
  );

  // 命令：为所有标签添加 Test ID
  const addToAllCommand = vscode.commands.registerCommand(
    'testid.addToAll',
    async () => {
      try {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showWarningMessage('请先打开一个文件');
          return;
        }

        const document = editor.document;
        const fullText = document.getText();

        // 获取配置（安全地处理没有工作区的情况）
        const workspaceFolder = getWorkspaceFolderSafely(document.uri);
        const config = getMergedConfig(workspaceFolder);

        // 解析所有标签
        const tags = parseTags(fullText, config);
        
        if (tags.length === 0) {
          vscode.window.showInformationMessage('文件中没有找到标签');
          return;
        }

        // 过滤需要处理的标签
        const tagsToProcess = tags.filter(tag => shouldProcessTag(tag.tagName, config));
        
        if (tagsToProcess.length === 0) {
          vscode.window.showInformationMessage('没有需要处理的标签（可能都被忽略或不在仅包含列表中）');
          return;
        }

        const testIdCounts = buildTestIdCounts(tags);

        // 确认操作
        const confirm = await vscode.window.showWarningMessage(
          `将为 ${tagsToProcess.length} 个标签添加 Test ID，是否继续？`,
          { modal: true },
          '确定',
          '取消'
        );

        if (confirm !== '确定') {
          return;
        }

        // 处理标签
        let processedText = fullText;

        // 按位置从后往前处理，避免位置偏移问题
        const sortedTags = [...tagsToProcess].sort((a, b) => b.startPos - a.startPos);
        
        for (const tag of sortedTags) {
          decrementTestIdCount(tag.testIdValue, testIdCounts);
          const newTag = addTestIdToTag(tag, config, testIdCounts);
          const before = processedText.substring(0, tag.startPos);
          const after = processedText.substring(tag.endPos);
          processedText = before + newTag + after;
        }

        // 替换整个文档
        const fullRange = new vscode.Range(
          document.positionAt(0),
          document.positionAt(fullText.length)
        );

        await editor.edit((editBuilder) => {
          editBuilder.replace(fullRange, processedText);
        });

        vscode.window.showInformationMessage(`已为 ${tagsToProcess.length} 个标签添加 Test ID`);
      } catch (error) {
        // 捕获所有可能的错误，包括来自 VS Code 内部的错误
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorName = error instanceof Error ? error.name : '';
        
        // 静默处理工作区相关的错误
        if (errorName === 'NoWorkspaceUriError' || 
            errorMessage.includes('NoWorkspaceUriError') ||
            errorMessage.includes('repoResult.error')) {
          // 这些错误不影响功能，静默处理
          return;
        }
        
        // 其他错误显示给用户
        console.error('执行命令时出错:', errorMessage);
        vscode.window.showErrorMessage(`执行命令时出错: ${errorMessage}`);
      }
    }
  );

  context.subscriptions.push(addToSelectionCommand, addToAllCommand);
}

/**
 * 停用扩展
 */
export function deactivate() {}

