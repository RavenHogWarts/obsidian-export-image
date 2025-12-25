import React, { StrictMode } from "react";
import { App, PluginSettingTab } from "obsidian";
import ExportImagePlugin from "./ExportImagePlugin";
import { Root, createRoot } from "react-dom/client";
import SettingPage from "./components/settings/SettingPage";


export default class ImageSettingTab extends PluginSettingTab {
	plugin: ExportImagePlugin;
	root: Root | null = null;
	icon: string = "square-dashed-bottom-code";

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
