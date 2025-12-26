import { App, PluginSettingTab } from "obsidian";
import { StrictMode } from "react";
import { Root, createRoot } from "react-dom/client";
import ExportImagePlugin from "../ExportImagePlugin";
import SettingPage from "./SettingPage";

export default class ImageSettingTab extends PluginSettingTab {
  plugin: ExportImagePlugin;
  root: Root | null = null;
  icon: string = "image-upscale";

  constructor(app: App, plugin: ExportImagePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    if (!this.root) {
      this.root = createRoot(containerEl);
    }

    this.renderContent();
  }

  hide() {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
    this.containerEl.empty();
  }

  private renderContent() {
    this.root?.render(
      <StrictMode>
        <SettingPage app={this.app} plugin={this.plugin} />
      </StrictMode>
    );
  }
}
