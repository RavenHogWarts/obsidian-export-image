import {
  Editor,
  MarkdownFileInfo,
  MarkdownView,
  Notice,
  Plugin,
  TFile,
  TFolder,
} from "obsidian";
import exportImage from "./components/file/exportImage";
import exportFolder from "./components/folder/exportFolder";
import L from "./i18n/L";
import { migrateLegacySettings } from "./settings/migrateSettings";
import ImageSettingTab from "./settings/SettingsTab";
import { DEFAULT_SETTINGS } from "./types/settings";
import { getMetadata, isMarkdownFile } from "./utils";

export default class ExportImagePlugin extends Plugin {
  settings!: ISettings;

  async epxortFile(file: TFile) {
    const frontmatter = getMetadata(file, this.app);
    const markdown = await this.app.vault.cachedRead(file);
    await exportImage(
      this.app,
      this.settings,
      markdown,
      file,
      frontmatter,
      "file",
    );
  }

  async onload() {
    await this.loadSettings();

    this.registerEvent(
      this.app.workspace.on("file-menu", (menu, file) => {
        if (file instanceof TFile && isMarkdownFile(file)) {
          menu.addItem((item) => {
            item
              .setTitle(L.exportImage())
              .setIcon("image-down")
              .onClick(async () => {
                await this.epxortFile(file);
              });
          });
        } else if (file instanceof TFolder) {
          menu.addItem((item) => {
            item
              .setTitle(L.exportFolder())
              .setIcon("image-down")
              .onClick(async () => {
                await exportFolder(this.app, this.settings, file);
              });
          });
        }
      }),
    );

    this.registerEvent(
      this.app.workspace.on("editor-menu", (menu, editor) => {
        const file: TFile =
          // @ts-ignore: Obsidian ts defined incomplete.
          (editor.editorComponent.file as TFile | undefined) ??
          this.app.workspace.getActiveFile()!;
        const frontmatter = getMetadata(file, this.app);
        if (!file) {
          return;
        }

        if (editor.somethingSelected()) {
          menu.addItem((item) => {
            item
              .setTitle(L.exportSelectionImage())
              .setIcon("text-select")
              .onClick(async () =>
                exportImage(
                  this.app,
                  this.settings,
                  editor.getSelection(),
                  file,
                  frontmatter,
                  "selection",
                ),
              );
          });
        }

        menu.addItem((item) => {
          item
            .setTitle(L.exportImage())
            .setIcon("image-down")
            .onClick(async () =>
              exportImage(
                this.app,
                this.settings,
                editor.getValue(),
                file,
                frontmatter,
                "file",
              ),
            );
        });
      }),
    );

    this.addCommand({
      id: "export-image",
      name: L.command(),
      checkCallback: (checking: boolean) => {
        // If checking is true, we're simply "checking" if the command can be run.
        // If checking is false, then we want to actually perform the operation.
        if (!checking) {
          (async () => {
            const activeFile = this.app.workspace.getActiveFile();
            if (
              !activeFile ||
              !["md", "markdown"].includes(activeFile.extension)
            ) {
              new Notice(L.noActiveFile());
              return;
            }

            const frontmatter = getMetadata(activeFile, this.app);
            const markdown = await this.app.vault.cachedRead(activeFile);
            await exportImage(
              this.app,
              this.settings,
              markdown,
              activeFile,
              frontmatter,
              "file",
            );
          })();
        }
        // This command will only show up in Command Palette when the check function returns true
        return true;
      },
    });

    this.addCommand({
      id: "export-image-selection",
      name: L.exportSelectionImage(),
      editorCheckCallback: (
        checking: boolean,
        editor: Editor,
        ctx: MarkdownView | MarkdownFileInfo,
      ) => {
        const file = ctx.file;
        if (!file || !["md", "markdown"].includes(file.extension)) {
          return false;
        }
        const frontmatter = getMetadata(file, this.app);
        const selection = editor.getSelection();
        if (!selection) {
          return false;
        }
        if (!checking) {
          exportImage(
            this.app,
            this.settings,
            selection,
            file,
            frontmatter,
            "selection",
          );
        }
        return true;
      },
    });

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new ImageSettingTab(this.app, this));
  }

  onunload() {
    // Empty
  }

  async loadSettings() {
    const loaded = ((await this.loadData()) as Partial<ISettings> | null) ?? {};
    const mergedSettings = {
      ...DEFAULT_SETTINGS,
      ...loaded,
    } as ISettings;

    const beforeMigration = JSON.stringify(mergedSettings);
    this.settings = migrateLegacySettings(mergedSettings, loaded);

    if (JSON.stringify(this.settings) !== beforeMigration) {
      await this.saveData(this.settings);
    }
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
