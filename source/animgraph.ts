import { AssetInfo } from '@cocos/creator-types/editor/packages/asset-db/@types/public';
import type { pTS_IAnimGraphState, pTS_IGraphDump, pTS_ILayerDump, pTS_IStateDump } from './main';

interface pTSEditorGlobal {
    Message: {
        broadcast(channel: string, payload: unknown): void;
        send(pkg: string, method: string, ...args: unknown[]): void;
        request(pkg: string, method: string, ...args: unknown[]): Promise<unknown>;
        addBroadcastListener(channel: string, listener: (payload: unknown) => void): void;
        removeBroadcastListener(channel: string, listener: (payload: unknown) => void): void;
    };
}

declare const Editor: pTSEditorGlobal;

export const $ = {
    container: '#pTS-animgraph-container',
    assetHeader: '#pTS-asset-header',
    assetNameText: '#pTS-asset-name-text',
    previewBanner: '#pTS-preview-banner',
    instanceSection: '#pTS-instance-section',
    instanceSelect: '#pTS-instance-select',
    previewStatusText: '#pTS-preview-status-text',
    previewSubText: '#pTS-preview-sub-text',
    variablesSection: '#pTS-variables-section',
    variablesContainer: '#pTS-variables-container',
    layersSection: '#pTS-layers-section',
    layerSelect: '#pTS-layer-select',
    graphCanvasContainer: '#pTS-graph-canvas-container',
    stateDetailsCard: '#pTS-state-details-card',
    stateDetailsContent: '#pTS-state-details-content',
    scriptCodePanel: '#pTS-script-code-panel',
    scriptHeaderTitle: '#pTS-script-header-title',
    scriptDisplay: '#pTS-script-display',
    editButton: '#pTS-edit-button',
};

export const style = `
.pTS-container {
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 8px 10px;
    gap: 10px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #ddd;
    box-sizing: border-box;
}

.pTS-asset-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid #383838;
}

.pTS-asset-name-text {
    font-weight: 600;
    font-size: 13px;
    color: #ffffff;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

#pTS-preview-banner {
    display: none;
    flex-direction: column;
    gap: 2px;
    padding: 8px 12px;
    border-radius: 4px;
    background: #2e7d32;
    border: 1px solid #4caf50;
    color: #ffffff;
    font-size: 12px;
    font-weight: 600;
}

#pTS-preview-banner.pTS-waiting {
    background: #e65100;
    border-color: #ff9800;
}

#pTS-preview-sub-text {
    font-size: 11px;
    font-weight: 400;
    opacity: 0.9;
    word-break: break-all;
}

.pTS-section-box {
    border: 1px solid #333333;
    border-radius: 4px;
    background: #242424;
    overflow: hidden;
}

.pTS-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 10px;
    background: #2a2a2a;
    border-bottom: 1px solid #333333;
    font-weight: 600;
    font-size: 12px;
}

.pTS-variables-list {
    display: flex;
    flex-direction: column;
    padding: 6px 10px;
    gap: 6px;
}

.pTS-var-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-size: 12px;
}

.pTS-var-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    opacity: 0.9;
}

.pTS-var-widget {
    flex: 1;
    min-width: 0;
}

.pTS-layer-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 10px;
    gap: 10px;
    background: #282828;
    border-bottom: 1px solid #333;
}

.pTS-select-dropdown {
    flex: 1;
    min-width: 140px;
    background: #333333;
    color: #ffffff;
    border: 1px solid #484848;
    border-radius: 3px;
    padding: 4px 8px;
    font-size: 12px;
    outline: none;
    cursor: pointer;
}

.pTS-select-dropdown:hover {
    border-color: #00bcd4;
}

.pTS-canvas-viewport {
    position: relative;
    width: 100%;
    height: 280px;
    background: #141414;
    background-image: 
        linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
    background-size: 20px 20px;
    overflow: hidden;
    border-bottom: 1px solid #333;
    cursor: default;
    user-select: none;
}

.pTS-graph-svg {
    width: 100%;
    height: 100%;
}

.pTS-svg-node {
    cursor: pointer;
    transition: transform 0.15s ease;
}

.pTS-svg-node:hover {
    filter: brightness(1.2);
}

.pTS-svg-node.pTS-selected rect {
    stroke: #00e5ff !important;
    stroke-width: 2.5px !important;
}

.pTS-svg-node.pTS-active-glow {
    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 16px rgba(0, 229, 255, 0.8)) !important;
}

.pTS-svg-node.pTS-active-glow rect {
    stroke: #ffffff !important;
    stroke-width: 2.5px !important;
    animation: pTS-node-pulse 1.4s infinite ease-in-out;
}

@keyframes pTS-node-pulse {
    0% { stroke: #ffffff; }
    50% { stroke: #00e5ff; }
    100% { stroke: #ffffff; }
}

#pTS-state-details-card {
    display: none;
    flex-direction: column;
    border: 1px solid #3a3a3a;
    border-radius: 4px;
    background: #202020;
    overflow: hidden;
    gap: 8px;
    padding: 10px;
}

.pTS-state-header-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: bold;
    font-size: 13px;
    color: #ffffff;
    border-bottom: 1px solid #333;
    padding-bottom: 6px;
}

.pTS-sub-card {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 8px;
    border-radius: 3px;
    background: #262626;
    border: 1px solid #333;
}

.pTS-sub-title {
    font-size: 11px;
    font-weight: 600;
    color: #4fc3f7;
    margin-bottom: 2px;
}

.pTS-prop-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-size: 11px;
}

.pTS-prop-label {
    flex: 1;
    opacity: 0.85;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.pTS-prop-val {
    flex: 1;
    min-width: 0;
}

.pTS-asset-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 3px 6px;
    border-radius: 3px;
    background: #1e3a5f;
    border: 1px solid #2b6cb0;
    color: #ffffff;
    font-size: 11px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

#pTS-script-code-panel {
    display: none;
    flex-direction: column;
    border: 1px solid #333333;
    border-radius: 4px;
    background: #181818;
    overflow: hidden;
}

.pTS-script-header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    background: #242424;
    border-bottom: 1px solid #333333;
    font-size: 11px;
    font-weight: 600;
    color: #64b5f6;
}

#pTS-script-display {
    display: block;
    max-height: 240px;
    overflow: auto;
    font-family: Consolas, Monaco, monospace;
    font-size: 11px;
    padding: 8px;
    background: #121212;
    color: #e0e0e0;
}

#pTS-edit-button {
    width: 100%;
    margin-top: 4px;
}
`;

export const template = `
<div class="pTS-container" id="pTS-animgraph-container">
    <div class="pTS-asset-header" id="pTS-asset-header">
        <ui-icon value="animation-graph" color="true"></ui-icon>
        <span class="pTS-asset-name-text" id="pTS-asset-name-text">Animation Graph</span>
    </div>

    <div id="pTS-preview-banner">
        <span id="pTS-preview-status-text">🟢 Live Preview Mode</span>
        <span id="pTS-preview-sub-text">Waiting for runtime instance...</span>
    </div>

    <div class="pTS-section-box" id="pTS-instance-section">
        <div class="pTS-layer-bar">
            <span style="font-weight: 600; font-size: 12px;">Controller</span>
            <select id="pTS-instance-select" class="pTS-select-dropdown" title="No runtime controller"></select>
        </div>
    </div>

    <!-- Section 1: Live Variables -->
    <div class="pTS-section-box" id="pTS-variables-section">
        <div class="pTS-section-header">
            <span>Variables</span>
        </div>
        <div class="pTS-variables-list" id="pTS-variables-container">
            <span style="opacity: 0.6; font-size: 11px;">No variables in graph</span>
        </div>
    </div>

    <!-- Section 2: Layers & Live Graph Canvas -->
    <div class="pTS-section-box" id="pTS-layers-section">
        <div class="pTS-layer-bar">
            <span style="font-weight: 600; font-size: 12px;">Layers</span>
            <select id="pTS-layer-select" class="pTS-select-dropdown"></select>
        </div>
        <div class="pTS-layer-bar">
            <span>Weight</span>
            <ui-num-input id="pTS-layer-weight" min="0" max="1" step="0.05" disabled></ui-num-input>
        </div>
        <div class="pTS-canvas-viewport" id="pTS-graph-canvas-container">
            <svg class="pTS-graph-svg" id="pTS-canvas-svg">
                <defs id="pTS-svg-defs">
                    <marker id="pTS-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#ffffff" opacity="0.85" />
                    </marker>
                    <filter id="pTS-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="5" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                <g id="pTS-svg-transitions"></g>
                <g id="pTS-svg-nodes"></g>
            </svg>
        </div>
    </div>

    <!-- Section 3: Selected State Details Card (Hidden if no state selected) -->
    <div id="pTS-state-details-card">
        <div class="pTS-state-header-title">
            <span id="pTS-state-title-text">State: None</span>
        </div>
        <div id="pTS-state-details-content"></div>
    </div>

    <!-- Section 4: State Component TS Script Source Code Panel -->
    <div id="pTS-script-code-panel">
        <div class="pTS-script-header">
            <span id="pTS-script-header-title">TypeScript Source</span>
        </div>
        <ui-code language="typescript" id="pTS-script-display"></ui-code>
    </div>

    <!-- Section 5: Bottom Edit Button -->
    <ui-button id="pTS-edit-button" class="blue">Edit</ui-button>
</div>
`;

export interface pTS_IPanelContext {
    $?: Record<string, HTMLElement | null>;
    shadowRoot?: ShadowRoot | null;
}

const pTS_views = new WeakMap<HTMLElement, pTS_AnimGraphView>();

function pTS_getHost(context: unknown): HTMLElement | null {
    if (!context || typeof context !== 'object') return null;
    const panel = context as pTS_IPanelContext;
    return panel.$?.container || panel.shadowRoot?.querySelector<HTMLElement>('#pTS-animgraph-container') || null;
}

export async function update(this: unknown, assetList: AssetInfo[]) {
    const host = pTS_getHost(this);
    if (!host) return;
    let view = pTS_views.get(host);
    if (!view) {
        view = new pTS_AnimGraphView(host);
        pTS_views.set(host, view);
    }
    await view.update(assetList);
}

export function close(this: unknown) {
    const host = pTS_getHost(this);
    if (!host) return;
    pTS_views.get(host)?.close();
    pTS_views.delete(host);
}

export function hide(this: unknown) {
    const host = pTS_getHost(this);
    if (host) pTS_views.get(host)?.pause();
}

export function show(this: unknown) {
    const host = pTS_getHost(this);
    if (host) pTS_views.get(host)?.resume();
}

export class pTS_AnimGraphView {
    private pTS_currentAssetUuid = '';
    private pTS_currentAssetName = '';
    private pTS_currentDump: pTS_IGraphDump | null = null;
    private pTS_currentState: pTS_IAnimGraphState | null = null;
    private pTS_selectedLayerIndex = 0;
    private pTS_selectedState: pTS_IStateDump | null = null;
    private pTS_instanceId: string | null = null;
    private pTS_observerId = '';
    private pTS_subscriptionId: number | null = null;
    private pTS_requestVersion = 0;
    private pTS_scriptVersion = 0;
    private pTS_paused = false;
    private pTS_closed = false;
    private pTS_instancesKey = '';
    private pTS_layersKey = '';
    private pTS_variablesKey = '';
    private pTS_frame: HTMLElement | null = null;
    private readonly pTS_onHide = () => this.pause();
    private readonly pTS_onShow = () => this.resume();
    private readonly pTS_onDataChanged = (raw: unknown) => {
        if (!raw || typeof raw !== 'object' || this.pTS_paused || this.pTS_closed) return;
        const payload = raw as { observerId?: string; uuid?: string; subscriptionId?: number; instanceId?: string | null; state?: pTS_IAnimGraphState };
        if (payload.observerId !== this.pTS_observerId || payload.uuid !== this.pTS_currentAssetUuid || !payload.state) return;
        if (payload.subscriptionId !== payload.state.subscriptionId || payload.instanceId !== payload.state.instanceId) return;
        this.pTS_acceptState(payload.state, payload.subscriptionId);
    };

    constructor(private readonly pTS_panelHost: HTMLElement, private readonly pTS_nativeInspector = true) {
        Editor.Message.addBroadcastListener('pts-animgraph:data-changed', this.pTS_onDataChanged);
        this.pTS_setupEvents(pTS_panelHost);
        // panel-frame emits non-bubbling show/hide when its hidden attribute changes.
        // Walk through UI-PANEL shadow hosts rather than querying the global document.
        let ancestor: HTMLElement | null = pTS_panelHost;
        while (ancestor && ancestor.tagName !== 'PANEL-FRAME') {
            const root = ancestor.getRootNode();
            ancestor = ancestor.parentElement || (root instanceof ShadowRoot ? root.host as HTMLElement : null);
        }
        this.pTS_frame = ancestor;
        ancestor?.addEventListener('hide', this.pTS_onHide);
        ancestor?.addEventListener('show', this.pTS_onShow);
        this.pTS_paused = ancestor?.hidden || false;
    }

    async update(assetList: Array<{ uuid?: string; name?: string; url?: string; file?: string; importer?: string; type?: string }>) {
        const asset = assetList.length === 1 ? assetList[0] : null;
        if (!asset?.uuid || !(asset.importer === 'animation-graph' || /\.animgraph$/i.test(asset.file || asset.url || asset.name || '') || asset.type === 'cc.animation.AnimationGraph')) {
            this.pTS_releaseObservation();
            this.pTS_currentAssetUuid = '';
            this.pTS_currentDump = null;
            this.pTS_currentState = null;
            this.pTS_selectedState = null;
            this.pTS_panelHost.style.display = 'none';
            return;
        }
        this.pTS_panelHost.style.display = 'flex';
        this.pTS_currentAssetName = asset.name || asset.url?.split('/').pop() || 'Animation Graph';
        if (asset.uuid !== this.pTS_currentAssetUuid) {
            this.pTS_releaseObservation();
            this.pTS_currentAssetUuid = asset.uuid;
            this.pTS_instanceId = null;
            this.pTS_currentDump = null;
            this.pTS_currentState = null;
            this.pTS_selectedState = null;
            this.pTS_selectedLayerIndex = 0;
        }
        this.pTS_renderFullView(this.pTS_panelHost);
        if (!this.pTS_observerId && !this.pTS_paused) await this.pTS_observe();
    }

    pause() {
        this.pTS_paused = true;
        this.pTS_releaseObservation();
        this.pTS_currentState = null;
        this.pTS_selectedState = null;
        this.pTS_renderFullView(this.pTS_panelHost);
    }

    resume() {
        if (this.pTS_closed) return;
        this.pTS_paused = false;
        if (this.pTS_currentAssetUuid && !this.pTS_observerId) void this.pTS_observe();
    }

    close() {
        this.pTS_closed = true;
        this.pTS_releaseObservation();
        Editor.Message.removeBroadcastListener('pts-animgraph:data-changed', this.pTS_onDataChanged);
        this.pTS_frame?.removeEventListener('hide', this.pTS_onHide);
        this.pTS_frame?.removeEventListener('show', this.pTS_onShow);
        this.pTS_frame = null;
    }

    private pTS_releaseObservation() {
        ++this.pTS_requestVersion;
        ++this.pTS_scriptVersion;
        if (this.pTS_observerId) {
            Editor.Message.send('pts-animgraph', 'unobserve-animgraph', {
                observerId: this.pTS_observerId,
                uuid: this.pTS_currentAssetUuid,
                ...(this.pTS_subscriptionId === null ? {} : { subscriptionId: this.pTS_subscriptionId }),
            });
        }
        this.pTS_observerId = '';
        this.pTS_subscriptionId = null;
    }

    private async pTS_observe() {
        this.pTS_releaseObservation();
        if (!this.pTS_currentAssetUuid || this.pTS_paused || this.pTS_closed) return;
        const version = this.pTS_requestVersion;
        const observerId = this.pTS_observerId = `pTS-ag-view-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
        this.pTS_currentState = null;
        this.pTS_selectedState = null;
        this.pTS_renderFullView(this.pTS_panelHost);
        try {
            const result = await Editor.Message.request('pts-animgraph', 'observe-animgraph', {
                observerId, uuid: this.pTS_currentAssetUuid, instanceId: this.pTS_instanceId,
            });
            if (version !== this.pTS_requestVersion || observerId !== this.pTS_observerId || this.pTS_closed || this.pTS_paused) return;
            // A runtime push can arrive before this initial response. Keep the newer live state.
            if (!this.pTS_currentState && result && typeof result === 'object') this.pTS_acceptState(result as pTS_IAnimGraphState);
        } catch (error) {
            if (version !== this.pTS_requestVersion) return;
            this.pTS_releaseObservation();
            console.warn('[pTS-AnimGraph] Unable to observe selected graph:', error);
        }
    }

    private pTS_acceptState(state: pTS_IAnimGraphState, subscriptionId = state.subscriptionId) {
        if (state.uuid !== this.pTS_currentAssetUuid || typeof subscriptionId !== 'number') return;
        if (this.pTS_subscriptionId !== null && subscriptionId !== this.pTS_subscriptionId) return;
        if (this.pTS_instanceId !== null && state.instanceId !== this.pTS_instanceId) return;
        this.pTS_subscriptionId = subscriptionId;
        this.pTS_instanceId = state.instanceId;
        this.pTS_currentState = state;
        this.pTS_currentDump = state.dump || null;
        if (!state.found) this.pTS_selectedState = null;
        this.pTS_renderFullView(this.pTS_panelHost);
    }

    private pTS_setupEvents(root: HTMLElement) {
        root.querySelector('#pTS-edit-button')?.addEventListener('click', () => {
            if (this.pTS_currentAssetUuid) Editor.Message.send('asset-db', 'open-asset', this.pTS_currentAssetUuid);
        });
        root.querySelector('#pTS-layer-select')?.addEventListener('change', (event) => {
            this.pTS_selectedLayerIndex = Number((event.target as HTMLSelectElement).value);
            this.pTS_selectedState = null;
            this.pTS_renderLayersAndCanvas(root);
            this.pTS_renderStateDetails(root);
        });
        root.querySelector('#pTS-instance-select')?.addEventListener('change', (event) => {
            const id = (event.target as HTMLSelectElement).value;
            if (!id || id === this.pTS_instanceId) return;
            this.pTS_instanceId = id;
            void this.pTS_observe();
        });
        root.querySelector('#pTS-layer-weight')?.addEventListener('confirm', (event) => {
            if (!this.pTS_currentState?.found || !this.pTS_instanceId || this.pTS_subscriptionId === null) return;
            const weight = Number((event.target as HTMLInputElement).value);
            if (!Number.isFinite(weight) || weight < 0 || weight > 1) return;
            Editor.Message.send('pts-animgraph', 'set-animgraph-layer-weight', {
                observerId: this.pTS_observerId,
                uuid: this.pTS_currentAssetUuid,
                subscriptionId: this.pTS_subscriptionId,
                instanceId: this.pTS_instanceId,
                layerIndex: this.pTS_selectedLayerIndex,
                weight,
            });
        });
    }

    private pTS_renderFullView(root: HTMLElement) {
        const nameText = root.querySelector('#pTS-asset-name-text');
        if (nameText) nameText.textContent = this.pTS_currentAssetName || this.pTS_currentDump?.name || 'Animation Graph';
        const preview = !!this.pTS_currentState?.isPreview;
        // Native Inspector keeps its built-in Edit section as the sole authoring UI.
        root.style.display = this.pTS_nativeInspector && !preview ? 'none' : 'flex';
        const editButton = root.querySelector<HTMLElement>('#pTS-edit-button');
        if (editButton) editButton.style.display = this.pTS_nativeInspector ? 'none' : '';
        for (const selector of ['#pTS-preview-banner', '#pTS-instance-section', '#pTS-variables-section', '#pTS-layers-section']) {
            const element = root.querySelector<HTMLElement>(selector);
            if (element) element.style.display = preview ? '' : 'none';
        }
        if (!preview) {
            root.querySelector<HTMLElement>('#pTS-state-details-card')!.style.display = 'none';
            root.querySelector<HTMLElement>('#pTS-script-code-panel')!.style.display = 'none';
            return;
        }
        this.pTS_renderBanner(root);
        this.pTS_renderInstances(root);
        this.pTS_renderVariables(root);
        this.pTS_renderLayersAndCanvas(root);
        this.pTS_renderStateDetails(root);
    }

    private pTS_renderInstances(root: HTMLElement) {
        const select = root.querySelector<HTMLSelectElement>('#pTS-instance-select');
        if (!select) return;
        const instances = this.pTS_currentState?.instances || [];
        const key = JSON.stringify([instances, this.pTS_instanceId]);
        if (key !== this.pTS_instancesKey) {
            this.pTS_instancesKey = key;
            select.replaceChildren();
            for (const instance of instances) {
                const option = root.ownerDocument.createElement('option');
                option.value = instance.id;
                option.textContent = instance.path;
                option.title = instance.path;
                select.appendChild(option);
            }
        }
        const selected = instances.find(instance => instance.id === this.pTS_instanceId);
        if (!selected && !select.querySelector('option[data-unavailable]')) {
            const option = root.ownerDocument.createElement('option');
            option.value = this.pTS_instanceId || '';
            option.dataset.unavailable = 'true';
            option.textContent = this.pTS_instanceId ? 'Selected controller unavailable' : 'No runtime controller';
            option.title = option.textContent;
            select.prepend(option);
        }
        select.value = this.pTS_instanceId || '';
        select.title = selected?.path || (this.pTS_instanceId ? 'Selected controller unavailable' : 'No runtime controller');
        select.disabled = instances.length === 0;
    }

private pTS_renderBanner(root: HTMLElement) {
    const banner = root.querySelector('#pTS-preview-banner') as HTMLElement | null;
    const statusText = root.querySelector('#pTS-preview-status-text') as HTMLElement | null;
    const subText = root.querySelector('#pTS-preview-sub-text') as HTMLElement | null;
    if (!banner || !statusText || !subText) return;

    if (!this.pTS_currentState || !this.pTS_currentState.isPreview) {
        banner.style.display = 'none';
        return;
    }

    banner.style.display = 'flex';
    if (this.pTS_currentState.found) {
        banner.className = '';
        statusText.textContent = '🟢 Live Preview Mode (Runtime Instance Linked)';
        const nodePath = this.pTS_currentState.activeNode?.path || this.pTS_currentState.activeNode?.name || 'Active Node';
        const cls = this.pTS_currentState.controllerClass || 'AnimationController';
        subText.textContent = `Controller: ${nodePath} (${cls})`;
    } else {
        banner.className = 'pTS-waiting';
        statusText.textContent = '🟠 Live Preview Mode';
        subText.textContent = 'Waiting for runtime AnimationController...';
    }
}

private pTS_renderVariables(root: HTMLElement) {
    const container = root.querySelector('#pTS-variables-container') as HTMLElement | null;
    if (!container) return;

    const varsToRender = this.pTS_currentState?.found ? this.pTS_currentState.variables || [] : [];
    const envelope = {
        observerId: this.pTS_observerId,
        uuid: this.pTS_currentAssetUuid,
        subscriptionId: this.pTS_subscriptionId,
        instanceId: this.pTS_instanceId,
    };
    const key = JSON.stringify([varsToRender, envelope]);
    if (key === this.pTS_variablesKey) return;
    this.pTS_variablesKey = key;
    const sendVariable = (name: string, value: unknown) => {
        if (!this.pTS_currentState?.found || !envelope.instanceId || envelope.subscriptionId === null ||
            envelope.observerId !== this.pTS_observerId || envelope.instanceId !== this.pTS_instanceId ||
            envelope.subscriptionId !== this.pTS_subscriptionId) return;
        Editor.Message.send('pts-animgraph', 'set-animgraph-variable', { ...envelope, name, value });
    };

    if (!varsToRender || varsToRender.length === 0) {
        container.innerHTML = '<span style="opacity: 0.6; font-size: 11px;">No live variables available</span>';
        return;
    }

    let html = '';
    for (const v of varsToRender) {
        const isLive = !!(this.pTS_currentState && this.pTS_currentState.found);
        html += `<div class="pTS-var-row" data-name="${v.name}">
            <span class="pTS-var-name" title="${v.name}">${v.name}</span>
            <div class="pTS-var-widget">`;

        if (v.isTrigger) {
            html += `<ui-button class="pTS-trigger-btn" style="width: 100%; font-size: 11px;" ${isLive ? '' : 'disabled'}>Fire Trigger</ui-button>`;
        } else if (v.type === 1) {
            html += `<ui-checkbox class="pTS-bool-widget" value="${v.value === true}" ${isLive ? '' : 'disabled'}></ui-checkbox>`;
        } else if (v.type === 0 || v.type === 3) {
            const step = v.type === 3 ? '1' : '0.1';
            html += `<ui-num-input class="pTS-num-widget" value="${v.value ?? 0}" step="${step}" ${isLive ? '' : 'disabled'}></ui-num-input>`;
        } else {
            html += '<span style="font-size:11px;opacity:0.7;">Read-only runtime value</span>';
        }

        html += `</div></div>`;
        if (v.isTrigger) {
            html += `<div class="pTS-var-row" style="margin-top:-2px;margin-bottom:2px;">
                <span class="pTS-var-name" style="font-size:10px;opacity:0.6;margin-left:8px;">Reset on next frame</span>
                <ui-checkbox checked disabled style="transform:scale(0.85);"></ui-checkbox>
            </div>`;
        }
    }
    container.innerHTML = html;

    container.querySelectorAll('.pTS-trigger-btn').forEach((btn: Element) => {
        btn.addEventListener('click', (e: Event) => {
            const target = e.target as HTMLElement | null;
            const row = target?.closest('.pTS-var-row') as HTMLElement | null;
            const name = row?.dataset.name;
            if (name && this.pTS_currentAssetUuid) {
                sendVariable(name, true);
            }
        });
    });

    container.querySelectorAll('.pTS-bool-widget').forEach((chk: Element) => {
        chk.addEventListener('change', (e: Event) => {
            const target = e.target as (HTMLElement & { value?: boolean; checked?: boolean }) | null;
            const row = target?.closest('.pTS-var-row') as HTMLElement | null;
            const name = row?.dataset.name;
            const val = target?.value === true || target?.checked === true;
            if (name && this.pTS_currentAssetUuid) {
                sendVariable(name, val);
            }
        });
    });

    container.querySelectorAll('.pTS-num-widget').forEach((num: Element) => {
        num.addEventListener('confirm', (e: Event) => {
            const target = e.target as HTMLInputElement | null;
            const row = target?.closest('.pTS-var-row') as HTMLElement | null;
            const name = row?.dataset.name;
            const val = parseFloat(target?.value ?? '0');
            if (name && !isNaN(val) && this.pTS_currentAssetUuid) {
                sendVariable(name, val);
            }
        });
    });
}

private pTS_renderLayersAndCanvas(root: HTMLElement) {
    const layerSelect = root.querySelector<HTMLSelectElement>('#pTS-layer-select');
    const layers = this.pTS_currentDump?.layers || [];
    if (layerSelect) {
        const key = JSON.stringify(layers.map(layer => layer.name));
        if (key !== this.pTS_layersKey) {
            this.pTS_layersKey = key;
            layerSelect.replaceChildren();
            layers.forEach((layer, index) => {
                const option = root.ownerDocument.createElement('option');
                option.value = String(index);
                option.textContent = layer.name;
                option.title = layer.name;
                layerSelect.appendChild(option);
            });
        }
        if (this.pTS_selectedLayerIndex >= layers.length) this.pTS_selectedLayerIndex = 0;
        layerSelect.value = String(this.pTS_selectedLayerIndex);
        layerSelect.disabled = layers.length === 0;
    }
    const weightInput = root.querySelector<HTMLInputElement>('#pTS-layer-weight');
    if (weightInput) {
        const layer = this.pTS_currentState?.found
            ? this.pTS_currentState.layers?.find(item => item.index === this.pTS_selectedLayerIndex) : undefined;
        weightInput.toggleAttribute('disabled', !layer);
        if (layer) weightInput.value = String(layer.weight);
    }
    if (!layers.length) {
        root.querySelector('#pTS-svg-transitions')?.replaceChildren();
        root.querySelector('#pTS-svg-nodes')?.replaceChildren();
        return;
    }
    this.pTS_renderGraphSvg(root, layers[this.pTS_selectedLayerIndex]);
}

private pTS_renderGraphSvg(root: HTMLElement, layer: pTS_ILayerDump) {
    const transitionsGroup = root.querySelector('#pTS-svg-transitions') as SVGGElement | null;
    const nodesGroup = root.querySelector('#pTS-svg-nodes') as SVGGElement | null;
    const svgElem = root.querySelector('#pTS-canvas-svg') as SVGSVGElement | null;
    if (!transitionsGroup || !nodesGroup || !svgElem) return;

    const states = layer.states || [];
    const transitions = layer.transitions || [];

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    states.forEach(st => {
        const x = st.centerX;
        const y = st.centerY;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
    });

    if (minX === Infinity) { minX = 0; maxX = 400; minY = 0; maxY = 250; }
    const padding = 60;
    const boxW = Math.max(350, (maxX - minX) + padding * 2);
    const boxH = Math.max(220, (maxY - minY) + padding * 2);
    const viewLeft = minX - padding;
    const viewTop = minY - padding;

    svgElem.setAttribute('viewBox', `${viewLeft} ${viewTop} ${boxW} ${boxH}`);

    const statePosMap = new Map<string, { x: number; y: number }>();
    states.forEach(st => {
        statePosMap.set(st.name, { x: st.centerX, y: st.centerY });
    });

    let transitionsHtml = '';
    transitions.forEach(tr => {
        const fromPos = statePosMap.get(tr.from);
        const toPos = statePosMap.get(tr.to);
        if (fromPos && toPos) {
            const dx = toPos.x - fromPos.x;
            const dy = toPos.y - fromPos.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const offset = 32;
            const startX = fromPos.x + (dx / dist) * offset;
            const startY = fromPos.y + (dy / dist) * offset;
            const endX = toPos.x - (dx / dist) * offset;
            const endY = toPos.y - (dy / dist) * offset;

            transitionsHtml += `<path d="M ${startX} ${startY} L ${endX} ${endY}" stroke="#ffffff" stroke-width="2" opacity="0.85" marker-end="url(#pTS-arrow)" />`;
        }
    });
    transitionsGroup.innerHTML = transitionsHtml;

    let liveActivePath = '';
    if (this.pTS_currentState && this.pTS_currentState.found && this.pTS_currentState.layers) {
        const liveLayer = this.pTS_currentState.layers.find(l => l.index === layer.index);
        if (liveLayer && liveLayer.activeStatePath) {
            liveActivePath = liveLayer.activeStatePath;
        }
    }

    let nodesHtml = '';
    states.forEach(st => {
        const isSelected = this.pTS_selectedState && (this.pTS_selectedState.name === st.name || this.pTS_selectedState.id === st.id);
        const isActiveState = liveActivePath && (liveActivePath === st.path || liveActivePath.endsWith('/' + st.name));

        let fillColor = '#1a365d';
        let strokeColor = '#2b6cb0';
        if (st.type === 'Entry') { fillColor = '#1b5e20'; strokeColor = '#4caf50'; }
        else if (st.type === 'Exit') { fillColor = '#b71c1c'; strokeColor = '#f44336'; }
        else if (st.type === 'Any') { fillColor = '#4a148c'; strokeColor = '#ab47bc'; }
        else if (st.type === 'SubStateMachine') { fillColor = '#0f2b48'; strokeColor = '#00bcd4'; }

        const w = 76;
        const h = 28;
        const rx = 4;
        const x = st.centerX - w / 2;
        const y = st.centerY - h / 2;

        let nodeCls = 'pTS-svg-node';
        if (isSelected) nodeCls += ' pTS-selected';
        if (isActiveState) nodeCls += ' pTS-active-glow';

        nodesHtml += `<g class="${nodeCls}" data-name="${st.name}" transform="translate(${x}, ${y})">
            <rect width="${w}" height="${h}" rx="${rx}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1.5" />
            <text x="${w / 2}" y="${h / 2 + 4}" fill="#ffffff" font-size="11" font-weight="600" text-anchor="middle" pointer-events="none">${st.name}</text>
        </g>`;
    });
    nodesGroup.innerHTML = nodesHtml;

    nodesGroup.querySelectorAll('.pTS-svg-node').forEach((nodeElem: Element) => {
        nodeElem.addEventListener('click', (e: Event) => {
            e.stopPropagation();
            const target = nodeElem as SVGGElement;
            const stateName = target.dataset.name;
            const targetState = states.find(s => s.name === stateName);
            if (targetState) {
                this.pTS_selectedState = targetState;
                this.pTS_renderLayersAndCanvas(root);
                this.pTS_renderStateDetails(root);
            }
        });
    });

    const canvasViewport = root.querySelector('#pTS-graph-canvas-container') as HTMLElement | null;
    if (canvasViewport) {
        canvasViewport.onclick = (e: MouseEvent) => {
            const target = e.target as Element | null;
            if (target === svgElem || target?.tagName.toLowerCase() === 'svg' || target?.id === 'pTS-graph-canvas-container') {
                this.pTS_selectedState = null;
                this.pTS_renderLayersAndCanvas(root);
                this.pTS_renderStateDetails(root);
            }
        };
    }
}

private pTS_renderStateDetails(root: HTMLElement) {
    const card = root.querySelector('#pTS-state-details-card') as HTMLElement | null;
    const content = root.querySelector('#pTS-state-details-content') as HTMLElement | null;
    const titleText = root.querySelector('#pTS-state-title-text') as HTMLElement | null;
    const scriptPanel = root.querySelector('#pTS-script-code-panel') as HTMLElement | null;

    if (!card || !content || !titleText || !scriptPanel) return;

    if (!this.pTS_selectedState) {
        ++this.pTS_scriptVersion;
        card.style.display = 'none';
        scriptPanel.style.display = 'none';
        return;
    }

    card.style.display = 'flex';
    titleText.textContent = `State: ${this.pTS_selectedState.name}`;

    const st = this.pTS_selectedState;
    let html = '';

    html += `<div class="pTS-sub-card">
        <div class="pTS-prop-row">
            <span class="pTS-prop-label">Speed</span>
            <ui-num-input class="pTS-prop-val" value="${st.speed}" disabled></ui-num-input>
        </div>
        <div class="pTS-prop-row">
            <span class="pTS-prop-label">Speed Multiplier</span>
            <ui-checkbox class="pTS-prop-val" ${st.speedMultiplierEnabled ? 'checked' : ''} disabled></ui-checkbox>
        </div>
    </div>`;

    if (st.clipName || st.type === 'Motion') {
        html += `<div class="pTS-sub-card">
            <div class="pTS-sub-title">Animation Clip Motion</div>
            <div class="pTS-prop-row">
                <span class="pTS-prop-label">Clip</span>
                <div class="pTS-asset-badge pTS-prop-val">
                    <ui-icon value="animation-clip"></ui-icon>
                    <span>${st.clipName || 'cc.AnimationClip'}</span>
                </div>
            </div>
        </div>`;
    }

    const components = st.components || [];
    if (components.length > 0) {
        for (const comp of components) {
            html += `<div class="pTS-sub-card">
                <div class="pTS-sub-title">${comp.className}</div>`;

            let liveProps: Record<string, unknown> | null = null;
            if (this.pTS_currentState && this.pTS_currentState.found && this.pTS_currentState.components) {
                const stateComps = this.pTS_currentState.components[st.path];
                if (stateComps && typeof stateComps === 'object') {
                    const candidate = stateComps[comp.className];
                    if (candidate && typeof candidate === 'object') {
                        liveProps = candidate as Record<string, unknown>;
                    }
                }
            }

            const propKeys = Object.keys(comp.props);
            if (propKeys.length === 0) {
                html += `<span style="font-size: 11px; opacity: 0.6;">(No serialized properties)</span>`;
            } else {
                for (const pName of propKeys) {
                    const attr = comp.attrs[pName] || {};
                    const hasLiveValue = !!liveProps && Object.prototype.hasOwnProperty.call(liveProps, pName);
                    const val = hasLiveValue ? liveProps![pName] : undefined;

                    html += `<div class="pTS-prop-row">
                        <span class="pTS-prop-label" title="${pName}">${pName}</span>
                        <div class="pTS-prop-val">`;

                    if (!hasLiveValue) {
                        html += '<span style="font-size:11px;opacity:0.6;">Runtime value unavailable</span>';
                    } else if (attr.type === 'Enum' && Array.isArray(attr.enumList)) {
                        html += `<ui-select disabled style="width: 100%;">`;
                        attr.enumList.forEach((eItem: unknown) => {
                            const eObj = eItem as { name?: string; value?: unknown } | undefined;
                            const isSel = eObj?.value === val;
                            html += `<option value="${String(eObj?.value ?? '')}" ${isSel ? 'selected' : ''}>${eObj?.name || ''}</option>`;
                        });
                        html += `</ui-select>`;
                    } else if (typeof val === 'boolean') {
                        html += `<ui-checkbox value="${val}" disabled></ui-checkbox>`;
                    } else if (typeof val === 'number') {
                        html += `<ui-num-input value="${val}" disabled></ui-num-input>`;
                    } else if (val && typeof val === 'object' && 'uuid' in val && typeof val.uuid === 'string') {
                        const uuidStr = val.uuid;
                        html += `<div class="pTS-asset-badge"><span>${uuidStr.slice(0, 8)}...</span></div>`;
                    } else {
                        html += `<span style="font-size: 11px;">${String(val ?? '')}</span>`;
                    }

                    html += `</div></div>`;
                }
            }
            html += `</div>`;
        }
    }

    content.innerHTML = html;

    if (components.length > 0 && components[0].className) {
        void this.pTS_renderScriptCode(root, components[0].className);
    } else {
        scriptPanel.style.display = 'none';
    }
}

private async pTS_renderScriptCode(root: HTMLElement, className: string) {
    const scriptPanel = root.querySelector('#pTS-script-code-panel') as HTMLElement | null;
    const headerTitle = root.querySelector('#pTS-script-header-title') as HTMLElement | null;
    const codeDisplay = root.querySelector('#pTS-script-display') as HTMLElement | null;

    if (!scriptPanel || !headerTitle || !codeDisplay) return;
    const version = ++this.pTS_scriptVersion;
    const observation = this.pTS_observerId;

    scriptPanel.style.display = 'flex';
    headerTitle.textContent = `${className}.ts`;
    codeDisplay.textContent = '// Loading TypeScript source...';

    try {
        const resRaw = await Editor.Message.request('pts-animgraph', 'get-component-script', { className });
        if (this.pTS_closed || version !== this.pTS_scriptVersion || observation !== this.pTS_observerId) return;
        if (resRaw && typeof resRaw === 'object') {
            const res = resRaw as { scriptName?: string; content?: string };
            if (res.content) {
                headerTitle.textContent = res.scriptName || `${className}.ts`;
                codeDisplay.textContent = res.content;
                return;
            }
        }
        codeDisplay.textContent = `// Source file for ${className} not found in project assets.`;
    } catch (e) {
        if (this.pTS_closed || version !== this.pTS_scriptVersion || observation !== this.pTS_observerId) return;
        codeDisplay.textContent = `// Error loading script for ${className}: ${String(e)}`;
    }
}
}
