import type { App } from 'obsidian';
import L from 'src/L';
import { formatAvailable } from 'src/settings';
import { type CSSFileInfo, getCSSFiles } from 'src/utils/cssLoader';
import type ExportImagePlugin from 'src/ExportImagePlugin';

/**
 * 将 formConfig 的 SettingItem 格式转换为 FormItems 使用的 FieldSchema 格式
 * 用于统一设置页面和导出对话框的表单配置
 */
export const createSettingSchema = async (
    app: App,
    plugin: ExportImagePlugin
): Promise<FormSchema<ISettings>> => {
    // 获取 CSS 文件列表
    let cssFiles: CSSFileInfo[] = [];
    if (plugin.settings.customCSS.src) {
        try {
            cssFiles = await getCSSFiles(app, plugin.settings.customCSS.src);
        } catch (e) {
            console.warn('Failed to load css files', e);
        }
    }

    return [
        // 基础设置
        {
            label: L.setting.imageWidth.label(),
            path: 'width',
            type: 'number',
            desc: L.setting.imageWidth.description(),
        },
        // Padding 设置
        {
            label: L.setting.padding.top(),
            path: 'padding.top',
            type: 'number',
            desc: L.setting.padding.description(),
        },
        {
            label: L.setting.padding.right(),
            path: 'padding.right',
            type: 'number',
            desc: L.setting.padding.description(),
        },
        {
            label: L.setting.padding.bottom(),
            path: 'padding.bottom',
            type: 'number',
            desc: L.setting.padding.description(),
        },
        {
            label: L.setting.padding.left(),
            path: 'padding.left',
            type: 'number',
            desc: L.setting.padding.description(),
        },
        // 分割设置
        {
            label: L.setting.split.mode.label(),
            path: 'split.mode',
            type: 'select',
            desc: L.setting.split.mode.description(),
            options: [
                { value: 'none', text: L.setting.split.mode.none() },
                { value: 'fixed', text: L.setting.split.mode.fixed() },
                { value: 'hr', text: L.setting.split.mode.hr() },
                { value: 'auto', text: L.setting.split.mode.auto() },
            ],
        },
        {
            label: L.setting.split.height.label(),
            path: 'split.height',
            type: 'number',
            desc: L.setting.split.height.description(),
            when: (settings) => settings.split.mode !== 'none' && settings.split.mode !== 'hr',
        },
        {
            label: L.setting.split.overlap.label(),
            path: 'split.overlap',
            type: 'number',
            desc: L.setting.split.overlap.description(),
            when: (settings) => settings.split.mode === 'fixed',
        },
        // 显示设置
        {
            label: L.setting.filename.label(),
            path: 'showFilename',
            type: 'boolean',
            desc: L.setting.filename.description(),
        },
        {
            label: L.setting.metadata.label(),
            path: 'showMetadata',
            type: 'boolean',
        },
        // 分辨率和格式
        {
            label: L.setting.resolutionMode.label(),
            path: 'resolutionMode',
            type: 'select',
            desc: L.setting.resolutionMode.description(),
            options: [
                { value: '1x', text: '1x' },
                { value: '2x', text: '2x' },
                { value: '3x', text: '3x' },
                { value: '4x', text: '4x' },
            ],
        },
        {
            label: L.setting.format.title(),
            path: 'format',
            type: 'select',
            desc: L.setting.format.description(),
            options: [
                { value: 'png0', text: L.setting.format.png0() },
                { value: 'png1', text: L.setting.format.png1() },
                { value: 'jpg', text: L.setting.format.jpg() },
                { value: 'webp', text: '.webp' },
                { value: 'pdf', text: L.setting.format.pdf() },
            ].filter(({ value }) => formatAvailable.includes(value as FileFormat)),
        },
        {
            label: L.setting.quickExportSelection.label(),
            path: 'quickExportSelection',
            type: 'boolean',
            desc: L.setting.quickExportSelection.description(),
        },
        // 作者信息设置
        {
            label: L.setting.userInfo.show(),
            path: 'authorInfo.show',
            type: 'boolean',
        },
        {
            label: L.setting.userInfo.name(),
            path: 'authorInfo.name',
            type: 'string',
            when: (settings) => settings.authorInfo.show,
        },
        {
            label: L.setting.userInfo.remark(),
            path: 'authorInfo.remark',
            type: 'string',
            when: (settings) => settings.authorInfo.show,
        },
        {
            label: L.setting.userInfo.avatar.title(),
            path: 'authorInfo.avatar',
            type: 'file',
            desc: L.setting.userInfo.avatar.description(),
            when: (settings) => settings.authorInfo.show,
        },
        {
            label: L.setting.userInfo.position(),
            path: 'authorInfo.position',
            type: 'select',
            options: [
                { value: 'top', text: 'Top' },
                { value: 'bottom', text: 'Bottom' },
            ],
            when: (settings) => settings.authorInfo.show,
        },
        {
            label: L.setting.userInfo.align(),
            path: 'authorInfo.align',
            type: 'select',
            options: [
                { value: 'left', text: 'Left' },
                { value: 'center', text: 'Center' },
                { value: 'right', text: 'Right' },
            ],
            when: (settings) => settings.authorInfo.show,
        },
        // 水印设置
        {
            label: L.setting.watermark.enable.label(),
            path: 'watermark.enable',
            type: 'boolean',
            desc: L.setting.watermark.enable.description(),
        },
        {
            label: L.setting.watermark.type.label(),
            path: 'watermark.type',
            type: 'select',
            desc: L.setting.watermark.type.description(),
            options: [
                { value: 'text', text: L.setting.watermark.type.text() },
                { value: 'image', text: L.setting.watermark.type.image() },
            ],
            when: (settings) => settings.watermark.enable,
        },
        {
            label: L.setting.watermark.text.content(),
            path: 'watermark.text.content',
            type: 'string',
            when: (settings) => settings.watermark.enable && settings.watermark.type === 'text',
        },
        {
            label: L.setting.watermark.text.color(),
            path: 'watermark.text.color',
            type: 'color',
            when: (settings) => settings.watermark.enable && settings.watermark.type === 'text',
        },
        {
            label: L.setting.watermark.text.fontSize(),
            path: 'watermark.text.fontSize',
            type: 'number',
            when: (settings) => settings.watermark.enable && settings.watermark.type === 'text',
        },
        {
            label: L.setting.watermark.image.src.label(),
            path: 'watermark.image.src',
            type: 'file',
            when: (settings) => settings.watermark.enable && settings.watermark.type === 'image',
        },
        {
            label: L.setting.watermark.opacity(),
            path: 'watermark.opacity',
            type: 'number',
            when: (settings) => settings.watermark.enable,
        },
        {
            label: L.setting.watermark.rotate(),
            path: 'watermark.rotate',
            type: 'number',
            when: (settings) => settings.watermark.enable,
        },
        {
            label: L.setting.watermark.width(),
            path: 'watermark.width',
            type: 'number',
            when: (settings) => settings.watermark.enable,
        },
        {
            label: L.setting.watermark.height(),
            path: 'watermark.height',
            type: 'number',
            when: (settings) => settings.watermark.enable,
        },
        {
            label: L.setting.watermark.x(),
            path: 'watermark.x',
            type: 'number',
            when: (settings) => settings.watermark.enable,
        },
        {
            label: L.setting.watermark.y(),
            path: 'watermark.y',
            type: 'number',
            when: (settings) => settings.watermark.enable,
        },
        // 自定义 CSS 设置
        {
            label: L.setting.customCSS.enable.label(),
            path: 'customCSS.enable',
            type: 'boolean',
            desc: L.setting.customCSS.enable.description(),
        },
        {
            label: L.setting.customCSS.src.label(),
            path: 'customCSS.src',
            type: 'string',
            when: (settings) => settings.customCSS.enable,
        },
        {
            label: L.setting.customCSS.css.label(),
            path: 'customCSS.css',
            type: 'select',
            options: [
                { value: '', text: L.setting.customCSS.css.default() },
                ...cssFiles.map(file => ({ value: file.path, text: file.name }))
            ],
            when: (settings) => settings.customCSS.enable,
        },
    ];
};
