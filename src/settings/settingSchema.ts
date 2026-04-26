import type { App } from "obsidian";
import type ExportImagePlugin from "src/ExportImagePlugin";
import L from "src/i18n/L";
import { formatAvailable } from "src/types/settings";
import { getCSSFiles, type CSSFileInfo } from "src/utils/cssLoader";

/**
 * 将 formConfig 的 SettingItem 格式转换为 FormItems 使用的 FieldSchema 格式
 * 用于统一设置页面和导出对话框的表单配置
 */
export const createSettingSchema = async (
  app: App,
  plugin: ExportImagePlugin,
): Promise<FormSchema<ISettings>> => {
  // 获取 CSS 文件列表
  let cssFiles: CSSFileInfo[] = [];
  if (plugin.settings.customCSS.src) {
    try {
      cssFiles = await getCSSFiles(app, plugin.settings.customCSS.src);
    } catch (e) {
      console.warn("Failed to load css files", e);
    }
  }

  return [
    // 基础设置
    {
      label: L.setting.imageWidth.label(),
      path: "width",
      type: "number",
      desc: L.setting.imageWidth.description(),
    },
    // Padding 设置
    {
      label: L.setting.padding.top(),
      path: "padding.top",
      type: "number",
      desc: L.setting.padding.description(),
    },
    {
      label: L.setting.padding.right(),
      path: "padding.right",
      type: "number",
      desc: L.setting.padding.description(),
    },
    {
      label: L.setting.padding.bottom(),
      path: "padding.bottom",
      type: "number",
      desc: L.setting.padding.description(),
    },
    {
      label: L.setting.padding.left(),
      path: "padding.left",
      type: "number",
      desc: L.setting.padding.description(),
    },
    // 分割设置
    {
      label: L.setting.split.mode.label(),
      path: "split.mode",
      type: "select",
      desc: L.setting.split.mode.description(),
      options: [
        { value: "none", text: L.setting.split.mode.none() },
        { value: "fixed", text: L.setting.split.mode.fixed() },
        { value: "hr", text: L.setting.split.mode.hr() },
        { value: "auto", text: L.setting.split.mode.auto() },
      ],
    },
    {
      label: L.setting.split.height.label(),
      path: "split.height",
      type: "number",
      desc: L.setting.split.height.description(),
      when: (settings) =>
        settings.split.mode !== "none" && settings.split.mode !== "hr",
    },
    {
      label: L.setting.split.overlap.label(),
      path: "split.overlap",
      type: "number",
      desc: L.setting.split.overlap.description(),
      when: (settings) => settings.split.mode === "fixed",
    },
    // 显示设置
    {
      label: L.setting.filename.label(),
      path: "showFilename.mode",
      type: "select",
      desc: L.setting.filename.description(),
      options: [
        { value: "none", text: L.setting.filename.none() },
        { value: "custom", text: L.setting.filename.custom() },
        { value: "frontmatter", text: L.setting.filename.frontmatter() },
      ],
    },
    {
      label: L.setting.filename.frontmatterProperty(),
      path: "showFilename.frontmatterProperty",
      type: "string",
      desc: L.setting.filename.frontmatterPropertyDesc(),
      when: (settings) => settings.showFilename.mode === "frontmatter",
    },
    {
      label: L.setting.filename.customTitle(),
      path: "showFilename.customTitle",
      type: "string",
      when: (settings) => settings.showFilename.mode === "custom",
    },
    {
      label: L.setting.metadata.label(),
      path: "showMetadata",
      type: "boolean",
    },
    // 分辨率和格式
    {
      label: L.setting.resolutionMode.label(),
      path: "resolutionMode",
      type: "select",
      desc: L.setting.resolutionMode.description(),
      options: [
        { value: "1x", text: "1x" },
        { value: "2x", text: "2x" },
        { value: "3x", text: "3x" },
        { value: "4x", text: "4x" },
      ],
    },
    {
      label: L.setting.format.title(),
      path: "format",
      type: "select",
      desc: L.setting.format.description(),
      options: [
        { value: "png0", text: L.setting.format.png0() },
        { value: "png1", text: L.setting.format.png1() },
        { value: "jpg", text: L.setting.format.jpg() },
        { value: "webp", text: ".webp" },
        { value: "pdf", text: L.setting.format.pdf() },
      ].filter(({ value }) => formatAvailable.includes(value as FileFormat)),
    },
    {
      label: L.setting.quickExportSelection.label(),
      path: "quickExportSelection",
      type: "boolean",
      desc: L.setting.quickExportSelection.description(),
    },
    // 作者信息设置
    {
      label: L.setting.userInfo.show(),
      path: "authorInfo.show",
      type: "boolean",
    },
    {
      label: L.setting.userInfo.align(),
      path: "authorInfo.align",
      type: "select",
      options: [
        { value: "left", text: "Left" },
        { value: "center", text: "Center" },
        { value: "right", text: "Right" },
      ],
      when: (settings) => settings.authorInfo.show,
    },
    {
      label: "Show top author info",
      path: "authorInfo.showTop",
      type: "boolean",
      when: (settings) => settings.authorInfo.show,
    },
    {
      label: "Top name",
      path: "authorInfo.topName",
      type: "string",
      when: (settings) =>
        settings.authorInfo.show && Boolean(settings.authorInfo.showTop),
    },
    {
      label: "Top remark",
      path: "authorInfo.topRemark",
      type: "string",
      when: (settings) =>
        settings.authorInfo.show && Boolean(settings.authorInfo.showTop),
    },
    {
      label: "Top avatar",
      path: "authorInfo.topAvatar",
      type: "file",
      desc: L.setting.userInfo.avatar.description(),
      when: (settings) =>
        settings.authorInfo.show && Boolean(settings.authorInfo.showTop),
    },
    {
      label: "Show bottom author info",
      path: "authorInfo.showBottom",
      type: "boolean",
      when: (settings) => settings.authorInfo.show,
    },
    {
      label: "Bottom name",
      path: "authorInfo.bottomName",
      type: "string",
      when: (settings) =>
        settings.authorInfo.show && Boolean(settings.authorInfo.showBottom),
    },
    {
      label: "Bottom remark",
      path: "authorInfo.bottomRemark",
      type: "string",
      when: (settings) =>
        settings.authorInfo.show && Boolean(settings.authorInfo.showBottom),
    },
    {
      label: "Bottom avatar",
      path: "authorInfo.bottomAvatar",
      type: "file",
      desc: L.setting.userInfo.avatar.description(),
      when: (settings) =>
        settings.authorInfo.show && Boolean(settings.authorInfo.showBottom),
    },
    // 水印设置
    {
      label: L.setting.watermark.enable.label(),
      path: "watermark.enable",
      type: "boolean",
      desc: L.setting.watermark.enable.description(),
    },
    {
      label: L.setting.watermark.type.label(),
      path: "watermark.type",
      type: "select",
      desc: L.setting.watermark.type.description(),
      options: [
        { value: "text", text: L.setting.watermark.type.text() },
        { value: "image", text: L.setting.watermark.type.image() },
      ],
      when: (settings) => settings.watermark.enable,
    },
    {
      label: L.setting.watermark.text.content(),
      path: "watermark.text.content",
      type: "string",
      when: (settings) =>
        settings.watermark.enable && settings.watermark.type === "text",
    },
    {
      label: L.setting.watermark.text.color(),
      path: "watermark.text.color",
      type: "color",
      when: (settings) =>
        settings.watermark.enable && settings.watermark.type === "text",
    },
    {
      label: L.setting.watermark.text.fontSize(),
      path: "watermark.text.fontSize",
      type: "number",
      when: (settings) =>
        settings.watermark.enable && settings.watermark.type === "text",
    },
    {
      label: L.setting.watermark.image.src.label(),
      path: "watermark.image.src",
      type: "file",
      when: (settings) =>
        settings.watermark.enable && settings.watermark.type === "image",
    },
    {
      label: L.setting.watermark.opacity(),
      path: "watermark.opacity",
      type: "number",
      when: (settings) => settings.watermark.enable,
    },
    {
      label: L.setting.watermark.rotate(),
      path: "watermark.rotate",
      type: "number",
      when: (settings) => settings.watermark.enable,
    },
    {
      label: L.setting.watermark.width(),
      path: "watermark.width",
      type: "number",
      when: (settings) => settings.watermark.enable,
    },
    {
      label: L.setting.watermark.height(),
      path: "watermark.height",
      type: "number",
      when: (settings) => settings.watermark.enable,
    },
    {
      label: L.setting.watermark.x(),
      path: "watermark.x",
      type: "number",
      when: (settings) => settings.watermark.enable,
    },
    {
      label: L.setting.watermark.y(),
      path: "watermark.y",
      type: "number",
      when: (settings) => settings.watermark.enable,
    },
    // 自定义 CSS 设置
    {
      label: L.setting.customCSS.enable.label(),
      path: "customCSS.enable",
      type: "boolean",
      desc: L.setting.customCSS.enable.description(),
    },
    {
      label: L.setting.customCSS.src.label(),
      path: "customCSS.src",
      type: "string",
      desc: L.setting.customCSS.src.description(),
      when: (settings) => settings.customCSS.enable,
    },
    {
      label: L.setting.customCSS.css.label(),
      path: "customCSS.css",
      type: "select",
      options: [
        { value: "", text: L.setting.customCSS.css.default() },
        ...cssFiles.map((file) => ({ value: file.path, text: file.name })),
      ],
      desc: L.setting.customCSS.css.description(),
      when: (settings) => settings.customCSS.enable,
    },
  ];
};
