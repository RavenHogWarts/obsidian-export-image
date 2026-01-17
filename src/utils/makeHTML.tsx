/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  MarkdownRenderChild,
  MarkdownRenderer,
  MarkdownView,
  type App,
  type TFile,
} from "obsidian";
import { createRoot, type Root } from "react-dom/client";
import Target from "src/components/common/Target";
import { delay, getMetadata } from ".";

let root: Root | undefined;

// 等待渲染稳定（无 DOM 变更并且图片加载完成）
async function waitForRenderComplete(
  el: HTMLElement,
  options?: { timeout?: number; stableMs?: number }
) {
  const timeout = options?.timeout ?? 5000;
  const stableMs = options?.stableMs ?? 250;

  return new Promise<void>((resolve) => {
    const start = Date.now();
    let lastMutate = Date.now();

    const imgs = Array.from(el.querySelectorAll("img")) as HTMLImageElement[];
    const pendingImgs = new Set<HTMLImageElement>(imgs.filter((i) => !i.complete));

    const onImgLoaded = (ev: Event) => {
      pendingImgs.delete(ev.currentTarget as HTMLImageElement);
      lastMutate = Date.now();
    };

    pendingImgs.forEach((img) => img.addEventListener("load", onImgLoaded));

    const observer = new MutationObserver(() => {
      lastMutate = Date.now();
    });

    observer.observe(el, {
      subtree: true,
      childList: true,
      attributes: true,
      characterData: true,
    });

    const timer = setInterval(() => {
      const now = Date.now();
      // 如果没有待加载图片并且在stableMs内没有新的变更，则认为已稳定
      if (pendingImgs.size === 0 && now - lastMutate > stableMs) {
        cleanup();
        resolve();
      }
      if (now - start > timeout) {
        // 超时也返回，避免死等
        cleanup();
        resolve();
      }
    }, 100);

    function cleanup() {
      clearInterval(timer);
      observer.disconnect();
      pendingImgs.forEach((img) => img.removeEventListener("load", onImgLoaded));
    }
  });
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export default async function makeHTML(
  file: TFile,
  settings: ISettings,
  app: App,
  container: HTMLElement
) {
  if (root) {
    root.unmount();
    await delay(20);
    container.empty();
  }

  const markdown = await app.vault.cachedRead(file);
  const element = document.createElement("div");
  await MarkdownRenderer.render(
    app,
    markdown,
    element.createDiv(),
    file.path,
    app.workspace.getActiveViewOfType(MarkdownView) ||
      app.workspace.activeLeaf?.view ||
      new MarkdownRenderChild(element)
  );

  /* @ts-ignore */
  const metadataMap: Record<string, { type: MetadataType }> =
    app.metadataCache.getAllPropertyInfos();

  const frontmatter = getMetadata(file, app);

  root = createRoot(container);
  root.render(
    <Target
      frontmatter={frontmatter}
      setting={settings}
      title={file.basename}
      markdownEl={element}
      app={app}
      metadataMap={metadataMap}
      isProcessing
    />
  );
  await delay(100);

  // 等待内容稳定后再返回 element，保证图片 / 异步内容加载完成并触发必要的重新渲染
  await waitForRenderComplete(element, { timeout: 8000, stableMs: 300 });

  return element.closest(".export-image-root") || element;
}
