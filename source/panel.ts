import { pTS_AnimGraphView, style as pTS_viewStyle, template as pTS_viewTemplate } from './animgraph';

declare const Editor: {
    Message: {
        request(pkg: string, method: string, ...args: unknown[]): Promise<unknown>;
        send(pkg: string, method: string, ...args: unknown[]): void;
        addBroadcastListener(channel: string, listener: (payload: unknown) => void): void;
        removeBroadcastListener(channel: string, listener: (payload: unknown) => void): void;
    };
    Selection: {
        getSelected(type: string): string[];
    };
};

export const $ = {
    root: '.pTS-dock-root',
    assetSelect: '#pTS-dock-asset-select',
    refreshBtn: '#pTS-dock-refresh-btn',
    statusMsg: '#pTS-dock-status-msg',
    viewMount: '#pTS-dock-view-mount',
};

export const style = `
:host {
    display: block;
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #ddd;
    background: #1e1e1e;
}

.pTS-dock-root {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
}

.pTS-dock-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: #252525;
    border-bottom: 1px solid #383838;
    gap: 10px;
    flex: 0 0 auto;
}

.pTS-dock-title {
    font-weight: 600;
    font-size: 13px;
    color: #4fc3f7;
    white-space: nowrap;
}

.pTS-dock-picker-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 0;
    justify-content: flex-end;
}

.pTS-select-dropdown {
    background: #333333;
    color: #ffffff;
    border: 1px solid #484848;
    border-radius: 3px;
    padding: 4px 8px;
    font-size: 12px;
    outline: none;
    cursor: pointer;
    max-width: 320px;
    flex: 1;
}

.pTS-select-dropdown:hover {
    border-color: #00bcd4;
}

.pTS-dock-body {
    flex: 1 1 auto;
    overflow-y: auto;
    overflow-x: hidden;
    min-height: 0;
}

.pTS-dock-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 30px;
    text-align: center;
    color: #888;
    gap: 12px;
}

.pTS-dock-empty-icon {
    font-size: 36px;
    opacity: 0.5;
}

.pTS-dock-empty-title {
    font-size: 14px;
    font-weight: 600;
    color: #bbb;
}

.pTS-dock-empty-hint {
    font-size: 12px;
    max-width: 360px;
    line-height: 1.5;
}
`;

export const template = `
<div class="pTS-dock-root">
    <div class="pTS-dock-header">
        <div class="pTS-dock-title">Animation Graph Live Inspector</div>
        <div class="pTS-dock-picker-wrap">
            <span style="font-size: 11px; opacity: 0.7;">Graph:</span>
            <select id="pTS-dock-asset-select" class="pTS-select-dropdown"></select>
            <ui-button id="pTS-dock-refresh-btn" style="padding: 2px 8px; font-size: 11px;">🔄</ui-button>
        </div>
    </div>
    <div class="pTS-dock-body" id="pTS-dock-view-mount">
        <div class="pTS-dock-empty" id="pTS-dock-empty-placeholder">
            <div class="pTS-dock-empty-icon">📊</div>
            <div class="pTS-dock-empty-title">No Animation Graph Selected</div>
            <div class="pTS-dock-empty-hint">Please select a <b>.animgraph</b> asset in the Assets panel or pick one from the dropdown above to begin live inspection.</div>
        </div>
    </div>
</div>
`;

interface pTS_IAssetItem {
    uuid: string;
    url: string;
    name: string;
}

interface pTS_IDockPanelContext {
    $?: {
        assetSelect?: HTMLSelectElement | null;
        refreshBtn?: HTMLElement | null;
        viewMount?: HTMLElement | null;
    };
    shadowRoot?: ShadowRoot | null;
}

const pTS_dockViews = new WeakMap<object, pTS_AnimGraphDock>();

export async function ready(this: pTS_IDockPanelContext) {
    const select = this.$?.assetSelect || this.shadowRoot?.querySelector<HTMLSelectElement>('#pTS-dock-asset-select');
    const refresh = this.$?.refreshBtn || this.shadowRoot?.querySelector<HTMLElement>('#pTS-dock-refresh-btn');
    const mount = this.$?.viewMount || this.shadowRoot?.querySelector<HTMLElement>('#pTS-dock-view-mount');
    if (!select || !refresh || !mount) return;
    pTS_dockViews.get(this)?.close();
    const dock = new pTS_AnimGraphDock(select, refresh, mount);
    pTS_dockViews.set(this, dock);
    await dock.ready();
}

export function close(this: pTS_IDockPanelContext) {
    pTS_dockViews.get(this)?.close();
    pTS_dockViews.delete(this);
}

export function hide(this: pTS_IDockPanelContext) {
    pTS_dockViews.get(this)?.pause();
}

export function show(this: pTS_IDockPanelContext) {
    pTS_dockViews.get(this)?.resume();
}

class pTS_AnimGraphDock {
    private pTS_assets: pTS_IAssetItem[] = [];
    private pTS_selectedUuid = '';
    private pTS_view: pTS_AnimGraphView | null = null;
    private pTS_closed = false;
    private pTS_paused = false;
    private pTS_loadVersion = 0;
    private readonly pTS_onSelect = () => this.pTS_selectGraph(this.pTS_select.value);
    private readonly pTS_onRefresh = () => { void this.pTS_loadAssets(); };

    constructor(
        private readonly pTS_select: HTMLSelectElement,
        private readonly pTS_refresh: HTMLElement,
        private readonly pTS_mount: HTMLElement,
    ) {
        pTS_select.addEventListener('change', this.pTS_onSelect);
        pTS_refresh.addEventListener('click', this.pTS_onRefresh);
    }

    async ready() {
        await this.pTS_loadAssets();
        if (this.pTS_closed) return;
        const selected = Editor.Selection.getSelected('asset')[0];
        if (this.pTS_assets.some(asset => asset.uuid === selected)) this.pTS_selectGraph(selected);
    }

    pause() {
        this.pTS_paused = true;
        this.pTS_view?.pause();
    }

    resume() {
        this.pTS_paused = false;
        this.pTS_view?.resume();
    }

    close() {
        this.pTS_closed = true;
        ++this.pTS_loadVersion;
        this.pTS_select.removeEventListener('change', this.pTS_onSelect);
        this.pTS_refresh.removeEventListener('click', this.pTS_onRefresh);
        this.pTS_view?.close();
        this.pTS_view = null;
    }

    private async pTS_loadAssets() {
        const version = ++this.pTS_loadVersion;
        try {
            const result = await Editor.Message.request('asset-db', 'query-assets', { pattern: '**/*.animgraph' });
            if (this.pTS_closed || version !== this.pTS_loadVersion) return;
            this.pTS_assets = Array.isArray(result) ? result.map((asset: { uuid: string; url: string }) => ({
                uuid: asset.uuid, url: asset.url, name: asset.url.split('/').pop() || asset.uuid,
            })) : [];
            this.pTS_select.replaceChildren();
            const placeholder = this.pTS_select.ownerDocument.createElement('option');
            placeholder.value = '';
            placeholder.textContent = '-- Select an Animation Graph --';
            this.pTS_select.appendChild(placeholder);
            for (const asset of this.pTS_assets) {
                const option = this.pTS_select.ownerDocument.createElement('option');
                option.value = asset.uuid;
                option.textContent = asset.name;
                option.title = asset.url;
                this.pTS_select.appendChild(option);
            }
            if (this.pTS_selectedUuid && !this.pTS_assets.some(asset => asset.uuid === this.pTS_selectedUuid)) this.pTS_selectGraph('');
            this.pTS_select.value = this.pTS_selectedUuid;
        } catch (error) {
            if (!this.pTS_closed && version === this.pTS_loadVersion) console.warn('[pTS-AnimGraph] Unable to query graph assets:', error);
        }
    }

    private pTS_selectGraph(uuid: string) {
        if (this.pTS_closed || (uuid === this.pTS_selectedUuid && this.pTS_view)) return;
        this.pTS_view?.close();
        this.pTS_view = null;
        this.pTS_selectedUuid = uuid;
        this.pTS_select.value = uuid;
        this.pTS_select.title = this.pTS_assets.find(asset => asset.uuid === uuid)?.url || '';
        if (!uuid) {
            this.pTS_mount.innerHTML = '<div class="pTS-dock-empty"><div class="pTS-dock-empty-title">No Animation Graph Selected</div><div class="pTS-dock-empty-hint">Select a .animgraph asset above to inspect its runtime controllers during preview.</div></div>';
            return;
        }
        this.pTS_mount.innerHTML = `<style>${pTS_viewStyle}</style>${pTS_viewTemplate}`;
        const host = this.pTS_mount.querySelector<HTMLElement>('#pTS-animgraph-container');
        if (!host) return;
        this.pTS_view = new pTS_AnimGraphView(host, false);
        if (this.pTS_paused) this.pTS_view.pause();
        const asset = this.pTS_assets.find(item => item.uuid === uuid);
        void this.pTS_view.update([{ uuid, url: asset?.url, name: asset?.name, importer: 'animation-graph' }]);
    }
}
