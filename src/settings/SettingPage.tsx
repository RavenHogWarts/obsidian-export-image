import React, { type FC, useEffect, useState, useCallback } from 'react';
import type { App } from 'obsidian';
import type ExportImagePlugin from 'src/ExportImagePlugin';
import FormItems from '../components/common/form/FormItems';
import { createSettingSchema } from './settingSchema';
import { renderPreview } from 'src/settings/settingPreview';
import L from 'src/i18n/L';

interface SettingPageProps {
    app: App;
    plugin: ExportImagePlugin;
}

/**
 * React 设置页面组件
 * 使用 FormItems 渲染设置表单，复用 Obsidian 原生设置样式
 */
const SettingPage: FC<SettingPageProps> = ({ app, plugin }) => {
    const [settings, setSettings] = useState<ISettings>(plugin.settings);
    const [formSchema, setFormSchema] = useState<FormSchema<ISettings>>([]);
    const [previewRender, setPreviewRender] = useState<((setting: ISettings) => void) | null>(null);
    const previewRef = React.useRef<HTMLDivElement>(null);

    // 加载表单配置
    useEffect(() => {
        const loadSchema = async () => {
            const schema = await createSettingSchema(app, plugin);
            setFormSchema(schema);
        };
        loadSchema();
    }, [app, plugin, settings.customCSS.src]);

    // 初始化预览区域
    useEffect(() => {
        const initPreview = async () => {
            if (previewRef.current) {
                const render = await renderPreview(previewRef.current, app);
                setPreviewRender(() => render);
            }
        };
        initPreview();
    }, [app]);

    // 当设置变化时更新预览
    useEffect(() => {
        if (previewRender) {
            previewRender(settings);
        }
    }, [settings, previewRender]);

    // 更新设置的回调函数
    const handleUpdate = useCallback(async (newSettings: ISettings) => {
        // 更新本地状态
        setSettings(newSettings);
        // 同步到插件设置
        plugin.settings = newSettings;
        // 保存设置
        await plugin.saveSettings();
    }, [plugin]);

    return (
        <div className="export-image-settings">
            {/* 标题和链接 */}
            <h3>{L.setting.title()}</h3>
            <p>
                Github:{' '}
                <a
                    href="https://github.com/zhouhua/obsidian-export-image"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    zhouhua/obsidian-export-image
                </a>
            </p>

            {/* 设置表单 */}
            <FormItems
                formSchema={formSchema}
                settings={settings}
                update={handleUpdate}
                app={app}
            />

            {/* 预览区域 */}
            <div ref={previewRef}></div>
        </div>
    );
};

export default SettingPage;
