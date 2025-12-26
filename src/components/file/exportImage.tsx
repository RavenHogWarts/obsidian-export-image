/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  MarkdownRenderChild,
  MarkdownRenderer,
  MarkdownView,
  Modal,
  Notice,
  type App,
  type FrontMatterCache,
  type TFile,
} from "obsidian";
import { createRoot } from "react-dom/client";
import { delay } from "src/utils";
import { copy } from "src/utils/capture";
import L from "../../i18n/L";
import Target from "../common/Target";
import ModalContent from "./ModalContent";

export default async function (
  app: App,
  settings: ISettings,
  markdown: string,
  file: TFile,
  frontmatter: FrontMatterCache | undefined,
  type: "file" | "selection"
) {
  // 创建元素和模态框先
  const el = document.createElement("div");
  const skipConfig = type === "selection" && settings.quickExportSelection;

  // 如果是快速导出，创建隐藏的div元素进行处理
  if (skipConfig) {
    const div = createDiv();
    div.style.width = (settings.width || 400) + "px";
    div.style.position = "fixed";
    div.style.top = "9999px";
    div.style.left = "9999px";
    document.body.appendChild(div);
    const root = createRoot(div);
    root.render(
      <Target
        isProcessing={true}
        markdownEl={el}
        setting={{
          ...settings,
          showMetadata: false,
          showFilename: false,
          split: { overlap: 0, height: 0, mode: "none" },
        }}
        frontmatter={{}}
        title={file.basename}
        metadataMap={{}}
        app={app}
      />
    );

    // 先打开模态框，再加载内容
    await loadDocumentContent(app, el, markdown, file);

    try {
      await copy(
        div.querySelector(".export-image-root")!,
        settings.resolutionMode,
        settings.format
      );
    } catch (e) {
      console.error(e);
      new Notice(L.copyFail());
    } finally {
      root.unmount();
      div.remove();
    }
  } else {
    // 先创建模态框并显示加载状态
    const modal = new Modal(app);
    modal.setTitle(L.imageExportPreview());
    modal.modalEl.style.width = "85vw";
    modal.modalEl.style.maxWidth = "1500px";
    modal.open();
    const root = createRoot(modal.contentEl);

    /* @ts-ignore */
    const metadataMap: Record<string, { type: MetadataType }> =
      app.metadataCache.getAllPropertyInfos();

    // 渲染组件，组件内部会处理loading状态
    root.render(
      <ModalContent
        markdownEl={el}
        settings={settings}
        frontmatter={frontmatter}
        title={file.basename}
        metadataMap={metadataMap}
        app={app}
      />
    );

    // 异步加载文档内容
    await loadDocumentContent(app, el, markdown, file);

    // 发布一个自定义事件，通知内容已加载完成
    const loadedEvent = new CustomEvent("export-image-content-loaded");
    window.document.dispatchEvent(loadedEvent);

    modal.onClose = () => {
      root?.unmount();
    };
  }
}

// 提取加载文档内容的函数 - 使用 MarkdownRenderer 渲染完整内容
async function loadDocumentContent(
  app: App,
  el: HTMLElement,
  markdown: string,
  file: TFile
) {
  try {
    // 创建容器 div
    const contentDiv = document.createElement("div");
    contentDiv.className = "markdown-preview-view markdown-rendered";

    // 获取当前视图作为渲染上下文
    const view = app.workspace.getActiveViewOfType(MarkdownView);

    // 使用 MarkdownRenderer.render() 渲染完整的 markdown 内容
    await MarkdownRenderer.render(
      app,
      markdown,
      contentDiv,
      file.path,
      view || new MarkdownRenderChild(contentDiv)
    );

    // 设置元素内容
    el.innerHTML = "";
    el.appendChild(contentDiv);

    // 等待图片等资源加载完成
    await delay(200);

    return el;
  } catch (error) {
    console.error("[ExportImage] loadDocumentContent 发生错误:", error);
    return el;
  }
}
