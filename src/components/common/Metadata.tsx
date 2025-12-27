import {
  Binary,
  Calendar,
  CheckSquare,
  Clock,
  Forward,
  List,
  Tags,
  Text,
  X,
  type LucideProps,
} from "lucide-react";
import type { FrontMatterCache } from "obsidian";
import { type FC, type ReactNode } from "react";

interface MetadataProps {
  frontmatter: FrontMatterCache;
  metadataMap: Record<string, { type: MetadataType }>;
}

// 通用图标 props - 匹配 Obsidian 的 SVG 属性
const iconProps: LucideProps = {
  size: 24,
  strokeWidth: 2,
  className: "svg-icon",
};

// 图标映射 - 使用与 Obsidian 一致的 lucide 图标
const iconMap: Record<MetadataType, ReactNode> = {
  text: <Text {...iconProps} className="svg-icon lucide-text" />,
  number: <Binary {...iconProps} className="svg-icon lucide-binary" />,
  multitext: <List {...iconProps} className="svg-icon lucide-list" />,
  tags: <Tags {...iconProps} className="svg-icon lucide-tags" />,
  date: <Calendar {...iconProps} className="svg-icon lucide-calendar" />,
  datetime: <Clock {...iconProps} className="svg-icon lucide-clock" />,
  checkbox: (
    <CheckSquare {...iconProps} className="svg-icon lucide-check-square" />
  ),
  aliases: <Forward {...iconProps} className="svg-icon lucide-forward" />,
};

/**
 * 推断属性类型
 */
function inferType(
  name: string,
  value: unknown,
  metadataMap: Record<string, { type: MetadataType }>
): MetadataType {
  // 优先使用 metadataMap 中的类型定义
  const lowerName = name.toLowerCase();
  if (metadataMap[lowerName]?.type) {
    return metadataMap[lowerName].type;
  }

  // 特殊属性名
  if (name === "tags") return "tags";
  if (name === "aliases") return "aliases";
  if (name === "cssclasses" || name === "cssclass") return "multitext";

  // 根据值类型推断
  if (typeof value === "boolean") return "checkbox";
  if (typeof value === "number") return "number";
  if (Array.isArray(value)) return "multitext";
  if (typeof value === "string") {
    // 检查是否是日期格式
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return "date";
    if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(value)) return "datetime";
  }

  return "text";
}

/**
 * 渲染单个属性值 - 完全复刻 Obsidian 原生结构
 */
const PropertyValue: FC<{
  type: MetadataType;
  value: unknown;
}> = ({ type, value }) => {
  switch (type) {
    case "checkbox":
      return (
        <div className="metadata-property-value" data-property-type="checkbox">
          <input
            className="metadata-input-checkbox"
            type="checkbox"
            checked={Boolean(value)}
            data-indeterminate="false"
            readOnly
          />
        </div>
      );

    case "number":
      return (
        <div className="metadata-property-value" data-property-type="number">
          <input
            className="metadata-input metadata-input-number"
            inputMode="decimal"
            step="any"
            type="number"
            value={value !== null && value !== undefined ? Number(value) : ""}
            readOnly
          />
        </div>
      );

    case "date":
      return (
        <div className="metadata-property-value" data-property-type="date">
          <input
            className="metadata-input metadata-input-text mod-date"
            max="9999-12-31"
            type="date"
            value={String(value ?? "")}
          />
        </div>
      );

    case "datetime":
      return (
        <div className="metadata-property-value" data-property-type="datetime">
          <input
            className="metadata-input metadata-input-text mod-datetime"
            max="9999-12-31T23:59"
            type="datetime-local"
            value={String(value ?? "")}
          />
        </div>
      );

    case "tags": {
      const items = Array.isArray(value) ? value : value ? [value] : [];
      return (
        <div className="metadata-property-value" data-property-type="tags">
          <div className="multi-select-container">
            {items.map((item, index) => (
              <div className="multi-select-pill" key={index}>
                <div className="multi-select-pill-content">
                  <span>{String(item)}</span>
                </div>
                <div className="multi-select-pill-remove-button">
                  <X {...iconProps} className="svg-icon lucide-x" />
                </div>
              </div>
            ))}
            <div
              className="multi-select-input"
              contentEditable="true"
              autoCapitalize="none"
            ></div>
          </div>
        </div>
      );
    }

    case "multitext":
    case "aliases": {
      const items = Array.isArray(value) ? value : value ? [value] : [];
      return (
        <div className="metadata-property-value" data-property-type={type}>
          <div className="multi-select-container">
            {items.map((item, index) => (
              <div className="multi-select-pill" key={index}>
                <div className="multi-select-pill-content">{String(item)}</div>
                <div className="multi-select-pill-remove-button">
                  <X {...iconProps} className="svg-icon lucide-x" />
                </div>
              </div>
            ))}
            <div className="multi-select-input" contentEditable="true"></div>
          </div>
        </div>
      );
    }

    case "text":
    default: {
      let content = "";
      if (value !== null && value !== undefined) {
        if (typeof value === "string") {
          // 处理 [[link]] 格式
          const match = /^\[\[(.+)]]$/.exec(value);
          content = match ? match[1] : value;
        } else if (typeof value === "object") {
          content = JSON.stringify(value);
        } else {
          content = String(value);
        }
      }
      return (
        <div className="metadata-property-value" data-property-type="text">
          <div
            className="metadata-input-longtext"
            contentEditable="true"
            spellCheck="true"
          >
            {content}
          </div>
        </div>
      );
    }
  }
};

/**
 * Metadata 组件 - 完全复刻 Obsidian 原生的 metadata 属性视图结构
 */
const Metadata: FC<MetadataProps> = ({ frontmatter, metadataMap }) => {
  // 过滤掉内部属性
  const properties = Object.entries(frontmatter).filter(
    ([key]) => key !== "position"
  );

  // 跳过空的 frontmatter 或只有 cssclasses 的情况
  const displayableProperties = properties.filter(
    ([key]) => key !== "cssclasses" && key !== "cssclass"
  );

  if (displayableProperties.length === 0) {
    return null;
  }

  return (
    <div
      className="metadata-container"
      data-property-count={displayableProperties.length}
    >
      <div className="metadata-content">
        <div className="metadata-properties">
          {displayableProperties.map(([name, value]) => {
            const type = inferType(name, value, metadataMap);
            const icon = iconMap[type] || iconMap.text;

            return (
              <div
                className="metadata-property"
                key={name}
                data-property-key={name}
              >
                <div className="metadata-property-key">
                  <span
                    className="metadata-property-icon"
                    aria-disabled="false"
                  >
                    {icon}
                  </span>
                  <input
                    className="metadata-property-key-input"
                    autoCapitalize="none"
                    enterKeyHint="next"
                    type="text"
                    aria-label={name}
                    value={name}
                    readOnly
                  />
                </div>
                <PropertyValue type={type} value={value} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Metadata;
