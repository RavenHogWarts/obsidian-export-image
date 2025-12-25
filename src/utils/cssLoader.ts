import { type App, TFile, TFolder, normalizePath } from 'obsidian';

export interface CSSFileInfo {
    name: string;
    path: string;
}

/**
 * 获取指定文件夹中的所有 CSS 文件
 * @param app Obsidian App 实例
 * @param folderPath 文件夹路径（相对于 Vault 根目录）
 * @returns CSS 文件信息数组，按名称排序
 */
export async function getCSSFiles(app: App, folderPath: string): Promise<CSSFileInfo[]> {
    if (!folderPath?.trim()) {
        return [];
    }

    const normalizedPath = normalizePath(folderPath.trim());
    const folder = app.vault.getAbstractFileByPath(normalizedPath);

    if (!(folder instanceof TFolder)) {
        return [];
    }

    const cssFiles: CSSFileInfo[] = [];

    for (const child of folder.children) {
        if (child instanceof TFile && child.extension === 'css') {
            cssFiles.push({
                name: child.basename,
                path: child.path,
            });
        }
    }

    return cssFiles.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * 读取 CSS 文件内容
 * @param app Obsidian App 实例
 * @param filePath CSS 文件路径
 * @returns CSS 文件内容，如果读取失败返回空字符串
 */
export async function readCSSFile(app: App, filePath: string): Promise<string> {
    if (!filePath) {
        return '';
    }

    try {
        const file = app.vault.getAbstractFileByPath(filePath);
        if (!(file instanceof TFile)) {
            return '';
        }

        return await app.vault.read(file);
    } catch (error) {
        console.error('[Export Image] Failed to read CSS file:', filePath, error);
        return '';
    }
}

/**
 * 检查 CSS 文件夹是否存在
 * @param app Obsidian App 实例
 * @param folderPath 文件夹路径
 * @returns 是否存在
 */
export function isCSSFolderValid(app: App, folderPath: string): boolean {
    if (!folderPath?.trim()) {
        return false;
    }

    const normalizedPath = normalizePath(folderPath.trim());
    const folder = app.vault.getAbstractFileByPath(normalizedPath);
    return folder instanceof TFolder;
}
