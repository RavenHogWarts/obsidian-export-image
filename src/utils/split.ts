interface SplitPosition {
  startY: number;
  height: number;
}

interface SplitOptions {
  mode: SplitMode;
  height: number;
  overlap: number;
  totalHeight: number;
  margin?: number;
  threshold?: number;
  authorHeight?: number;
  container?: HTMLElement;
}

interface ElementMeasure {
  top: number;
  height: number;
}

interface BoundaryPoint {
  position: number;
  type: "heading" | "paragraph" | "list-item";
  priority: number;
}

/**
 * 获取元素位置信息
 * @param container 容器元素
 * @param mode 分割模式
 * @returns 元素位置信息数组
 */
export function getElementMeasures(
  container: HTMLElement,
  mode: SplitMode
): ElementMeasure[] {
  if (mode === "hr") {
    // 查找所有 hr 元素的位置
    const hrs = container.querySelectorAll("hr");
    return Array.from(hrs).map((hr) => {
      const rect = hr.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      return {
        top: rect.top - containerRect.top,
        height: rect.height,
      };
    });
  } else if (mode === "auto") {
    // 查找所有段落元素的位置
    const paragraphs = Array.from(
      container.find(".export-image-markdown>div")!.children
    );
    const containerRect = container.getBoundingClientRect();

    return paragraphs.map((p, index) => {
      const rect = p.getBoundingClientRect();
      const currentTop = rect.top - containerRect.top;

      if (index < paragraphs.length - 1) {
        // 如果不是最后一个元素，高度取到下一个元素的顶部
        const nextRect = paragraphs[index + 1].getBoundingClientRect();
        const nextTop = nextRect.top - containerRect.top;
        return {
          top: currentTop,
          height: nextTop - currentTop,
        };
      } else {
        // 最后一个元素使用其实际高度
        return {
          top: currentTop,
          height: rect.height,
        };
      }
    });
  }
  return [];
}

/**
 * 获取元素相对于容器的顶部位置
 */
function getElementTop(element: HTMLElement, container: HTMLElement): number {
  const rect = element.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  return rect.top - containerRect.top;
}

/**
 * 识别智能拆分的边界点
 * @param container 容器元素
 * @returns 边界点数组
 */
export function findBoundaryPoints(container: HTMLElement): BoundaryPoint[] {
  const points: BoundaryPoint[] = [];

  // 1. 标题前 (priority: 1) - h1-h6
  const headings = container.querySelectorAll("h1, h2, h3, h4, h5, h6");
  headings.forEach((heading) => {
    const position = getElementTop(heading as HTMLElement, container);
    points.push({
      position,
      type: "heading",
      priority: 1,
    });
  });

  // 2. 段落边界 (priority: 2) - .export-image-markdown > div 的子元素之间
  const markdownContainer = container.querySelector(".export-image-markdown>div");
  if (markdownContainer) {
    const children = Array.from(markdownContainer.children);
    for (let i = 1; i < children.length; i++) {
      const position = getElementTop(children[i] as HTMLElement, container);
      points.push({
        position,
        type: "paragraph",
        priority: 2,
      });
    }
  }

  // 3. 列表项之间 (priority: 3) - li 元素之间
  const lists = container.querySelectorAll("ol, ul");
  lists.forEach((list) => {
    const items = list.querySelectorAll("li");
    for (let i = 1; i < items.length; i++) {
      const position = getElementTop(items[i] as HTMLElement, container);
      points.push({
        position,
        type: "list-item",
        priority: 3,
      });
    }
  });

  // 按位置排序
  return points.sort((a, b) => a.position - b.position);
}

/**
 * 计算分割位置
 * @param options 分割选项
 * @param elements 元素测量数据，仅在 hr 和 auto 模式下需要
 * @returns 分割位置数组
 */
export function calculateSplitPositions(
  options: SplitOptions,
  elements?: ElementMeasure[]
): SplitPosition[] {
  const { mode, height, overlap, totalHeight } = options;
  const positions: SplitPosition[] = [];
  if (mode === "hr" && elements) {
    // 按分隔线切割
    let lastY = 0;
    elements.forEach((el, index) => {
      const currentY = el.top;
      if (index === 0) {
        positions.push({ startY: 0, height: currentY });
      } else {
        positions.push({ startY: lastY, height: currentY - lastY });
      }
      lastY = currentY;
    });
    // 添加最后一部分
    if (lastY < totalHeight) {
      positions.push({ startY: lastY, height: totalHeight - lastY });
    }
  } else if (mode === "auto" && elements) {
    // 按段落自动切割
    let currentStartY = 0;
    let currentHeight = 0;

    for (let i = 0; i < elements.length - 1; i++) {
      const item = elements[i];
      currentHeight += item.height + (i === 0 ? item.top : 0);
      if (currentHeight >= height) {
        positions.push({ startY: currentStartY, height: currentHeight });
        currentStartY += currentHeight;
        currentHeight = 0;
        continue;
      }
      const delta = height - currentHeight;
      if (delta < elements[i + 1].height / 2) {
        positions.push({ startY: currentStartY, height: currentHeight });
        currentStartY += currentHeight;
        currentHeight = 0;
      }
    }
    // 添加最后一部分
    if (currentStartY < totalHeight) {
      positions.push({
        startY: currentStartY,
        height: totalHeight - currentStartY,
      });
    }
  } else {
    // 智能固定高度模式
    const margin = options.margin ?? 40;
    const threshold = options.threshold ?? 60;
    const authorHeight = options.authorHeight ?? 0;

    // 计算内容高度（扣除作者信息）
    const contentHeight = Math.max(0, totalHeight - authorHeight);
    // 可用内容高度
    const availableHeight = Math.max(height - margin * 2, 100);

    // 识别所有边界点
    const boundaries = options.container ? findBoundaryPoints(options.container) : [];

    // 从上到下累积内容并拆分
    let currentY = 0;
    let boundaryIndex = 0;

    while (currentY < contentHeight) {
      const targetEndY = currentY + availableHeight;

      // 找到当前范围内最接近目标高度的边界点
      let bestBoundary: BoundaryPoint | null = null;
      while (boundaryIndex < boundaries.length) {
        const b = boundaries[boundaryIndex];
        if (b.position > targetEndY + threshold) break;
        if (b.position > currentY && b.position <= targetEndY) {
          bestBoundary = b;
        }
        boundaryIndex++;
      }

      // 决策拆分位置
      let splitY: number;
      if (bestBoundary && targetEndY - bestBoundary.position <= threshold) {
        // 边界接近目标高度，在边界处截断
        splitY = bestBoundary.position;
      } else if (bestBoundary) {
        // 边界较远，但仍然在范围内，尽可能填充到边界
        splitY = bestBoundary.position;
      } else {
        // 没有合适的边界点，尽可能填充到目标高度
        splitY = Math.min(targetEndY, contentHeight);
      }

      // 添加拆分位置
      const pageHeight = Math.min(splitY - currentY + margin * 2, height);
      positions.push({
        startY: currentY,
        height: pageHeight,
      });

      currentY = splitY;

      // 防止无限循环
      if (pageHeight <= 0) break;
    }

    // 最后一页加上作者信息
    if (positions.length > 0 && authorHeight > 0) {
      const lastPage = positions[positions.length - 1];
      lastPage.height += authorHeight;
    }
  }
  return positions;
}

/**
 * 计算分割线位置
 * @param options 分割选项
 * @param elements 元素测量数据，仅在 hr 和 auto 模式下需要
 * @returns 分割线位置数组
 */
export function calculateSplitLines(
  options: SplitOptions,
  elements?: ElementMeasure[]
): number[] {
  const positions = calculateSplitPositions(options, elements);
  // 除了最后一个位置，其他位置都需要显示分割线
  return positions.slice(0, -1).map((p) => p.startY + p.height);
}
