import type { AssetInfo } from '@cocos/creator-types/editor/packages/asset-db/@types/public';
import type { pTS_IAnimGraphState, pTS_IGraphDump, pTS_ILayerDump, pTS_IStateDump, pTS_IStateMachineDump, pTS_ITransitionDump } from './main';

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
    transitionDetailsCard: '#pTS-transition-details-card',
    transitionDetailsContent: '#pTS-transition-details-content',
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
    flex-shrink: 0;
    min-width: 0;
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
    min-height: 280px;
    box-sizing: border-box;
    padding: 8px;
    background: #141414;
    cursor: default;
    user-select: none;
}

.pTS-machine-card {
    min-width: 0;
    margin-bottom: 10px;
    border: 1px solid #3c4856;
    border-radius: 4px;
    overflow: hidden;
}

.pTS-machine-header {
    padding: 8px;
    background: #252e39;
    font-size: 12px;
    font-weight: 600;
    overflow-wrap: anywhere;
}

.pTS-machine-path {
    display: block;
    margin-top: 3px;
    color: #abbfd3;
    font-size: 11px;
    font-weight: 400;
}
.pTS-machine-viewport {
    height: auto;
    min-height: 0;
    overflow: hidden;
    background-image:
        linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
    background-size: 20px 20px;
}

.pTS-graph-svg {
    display: block;
    width: 100%;
    height: auto;
}

.pTS-svg-node {
    cursor: pointer;
    transition: transform 0.15s ease;
}

.pTS-svg-node:hover {
    filter: brightness(1.2);
}

.pTS-svg-node.pTS-active-glow {
    filter: drop-shadow(0 0 5px rgba(113, 255, 157, 0.65));
}

.pTS-svg-node.pTS-active-glow rect {
    stroke: #71ff9d;
    stroke-width: 2.5px;
}

.pTS-svg-node.pTS-active-ancestor rect {
    stroke: #e4c56e;
    stroke-dasharray: 5 3;
}

.pTS-svg-node.pTS-selected rect {
    stroke: #00e5ff;
    stroke-width: 3px;
}

.pTS-svg-node.pTS-selected text {
    fill: #7df4ff;
}

.pTS-svg-transition {
    cursor: pointer;
}

.pTS-transition-hit {
    fill: none;
    stroke: transparent;
    stroke-width: 18px;
    vector-effect: non-scaling-stroke;
    pointer-events: stroke;
}

.pTS-transition-arrow {
    fill: none;
    stroke: #cbd5e1;
    stroke-width: 1.5px;
    vector-effect: non-scaling-stroke;
    pointer-events: none;
}

.pTS-svg-transition:hover .pTS-transition-arrow {
    stroke: #fff1a8;
    stroke-width: 3px;
    marker-end: var(--pTS-arrow-hover);
}

.pTS-svg-transition.pTS-selected .pTS-transition-arrow {
    stroke: #00e5ff;
    stroke-width: 3px;
    marker-end: var(--pTS-arrow-selected);
}

#pTS-transition-details-card {
    display: none;
    flex-direction: column;
    gap: 8px;
    padding: 10px;
}
.pTS-transition-summary {
    font-weight: bold;
    font-size: 13px;
    color: #ffffff;
    letter-spacing: 0.5px;
    overflow-wrap: anywhere;
}

.pTS-condition-note {
    font-size: 11px;
    line-height: 1.5;
    opacity: 0.8;
    overflow-wrap: anywhere;
}

.pTS-transition-fields {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.pTS-transition-property-children {
    border-left: 1px solid #465363;
    padding-left: 12px;
    margin-left: 6px;
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
        <div class="pTS-canvas-viewport" id="pTS-graph-canvas-container"></div>
    </div>

    <div class="pTS-section-box" id="pTS-transition-details-card">
        <div class="pTS-state-header-title">Transition conditions · Read only</div>
        <div id="pTS-transition-details-content"></div>
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
let pTS_nextViewId = 0;

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
    private pTS_selectedTransition: { machineId: string; id: string } | null = null;
    private pTS_transitionDetailsKey = '';
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
    private pTS_graphKey = '';
    private pTS_graphRevision = 0;
    private readonly pTS_viewId = `${++pTS_nextViewId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    private readonly pTS_graphNodes = new Map<string, { element: SVGGElement; path: string }>();
    private readonly pTS_graphTransitions = new Map<string, SVGGElement>();
    private pTS_detailsKey = '';
    private pTS_detailUpdates: Array<() => void> = [];
    private pTS_scriptKey = '';
    private pTS_frame: HTMLElement | null = null;
    private readonly pTS_eventDisposers: Array<() => void> = [];
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
        const header = pTS_panelHost.querySelector<HTMLElement>('#pTS-asset-header');
        if (header) header.style.display = pTS_nativeInspector ? 'none' : '';
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
        if (this.pTS_closed) return;
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
        for (const dispose of this.pTS_eventDisposers) dispose();
        this.pTS_eventDisposers.length = 0;
        Editor.Message.removeBroadcastListener('pts-animgraph:data-changed', this.pTS_onDataChanged);
        this.pTS_frame?.removeEventListener('hide', this.pTS_onHide);
        this.pTS_frame?.removeEventListener('show', this.pTS_onShow);
        this.pTS_frame = null;
    }

    private pTS_releaseObservation() {
        ++this.pTS_requestVersion;
        ++this.pTS_scriptVersion;
        this.pTS_scriptKey = '';
        this.pTS_selectedState = null;
        this.pTS_selectedTransition = null;
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
        if (state.instanceId !== this.pTS_instanceId || state.isPreview !== this.pTS_currentState?.isPreview) {
            this.pTS_selectedState = null;
            this.pTS_selectedTransition = null;
        }
        this.pTS_subscriptionId = subscriptionId;
        this.pTS_instanceId = state.instanceId;
        this.pTS_currentState = state;
        this.pTS_currentDump = state.dump || null;
        const selectedId = this.pTS_selectedState?.id;
        this.pTS_selectedState = state.found ? this.pTS_findState(selectedId) : null;
        if (!state.found || !this.pTS_findTransition(this.pTS_selectedTransition)) this.pTS_selectedTransition = null;
        this.pTS_renderFullView(this.pTS_panelHost);
    }

    private pTS_findState(id: string | undefined): pTS_IStateDump | null {
        if (!id) return null;
        for (const machine of this.pTS_currentDump?.layers[this.pTS_selectedLayerIndex]?.stateMachines || []) {
            const state = machine.states.find(item => item.id === id);
            if (state) return state;
        }
        return null;
    }

    private pTS_findTransition(selection: { machineId: string; id: string } | null): { machine: pTS_IStateMachineDump; transition: pTS_ITransitionDump } | null {
        if (!selection) return null;
        const machine = this.pTS_currentDump?.layers[this.pTS_selectedLayerIndex]?.stateMachines.find(item => item.id === selection.machineId);
        const transition = machine?.transitions.find(item => item.id === selection.id);
        return machine && transition ? { machine, transition } : null;
    }

    private pTS_setupEvents(root: HTMLElement) {
        const listen = (selector: string, type: string, listener: EventListener) => {
            const element = root.querySelector(selector);
            element?.addEventListener(type, listener);
            this.pTS_eventDisposers.push(() => element?.removeEventListener(type, listener));
        };
        listen('#pTS-edit-button', 'click', () => {
            if (this.pTS_currentAssetUuid) Editor.Message.send('asset-db', 'open-asset', this.pTS_currentAssetUuid);
        });
        listen('#pTS-layer-select', 'change', (event) => {
            this.pTS_selectedLayerIndex = Number((event.target as HTMLSelectElement).value);
            this.pTS_selectedState = null;
            this.pTS_selectedTransition = null;
            this.pTS_renderLayersAndCanvas(root);
            this.pTS_renderStateDetails(root);
            this.pTS_renderTransitionDetails(root);
        });
        listen('#pTS-instance-select', 'change', (event) => {
            const id = (event.target as HTMLSelectElement).value;
            if (!id || id === this.pTS_instanceId) return;
            this.pTS_instanceId = id;
            void this.pTS_observe();
        });
        listen('#pTS-graph-canvas-container', 'click', (event) => {
            const target = event.target as Element | null;
            const edge = target?.closest<SVGGElement>('.pTS-svg-transition');
            const node = target?.closest<SVGGElement>('.pTS-svg-node');
            if (edge) {
                const selection = { machineId: edge.dataset.machineId || '', id: edge.dataset.transitionId || '' };
                this.pTS_selectedTransition = this.pTS_findTransition(selection) ? selection : null;
                this.pTS_selectedState = null;
            } else if (node) {
                this.pTS_selectedState = this.pTS_findState(node.dataset.stateId);
                this.pTS_selectedTransition = null;
            } else if (target?.closest('.pTS-machine-header')) {
                return;
            } else {
                this.pTS_selectedState = null;
                this.pTS_selectedTransition = null;
            }
            this.pTS_patchGraphState();
            this.pTS_renderStateDetails(root);
            this.pTS_renderTransitionDetails(root);
        });
        listen('#pTS-layer-weight', 'confirm', (event) => {
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
        this.pTS_setText(nameText, this.pTS_currentAssetName || this.pTS_currentDump?.name || 'Animation Graph');
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
            this.pTS_selectedState = null;
            this.pTS_selectedTransition = null;
            this.pTS_renderTransitionDetails(root);
            this.pTS_clearDetails();
            root.querySelector<HTMLElement>('#pTS-state-details-card')!.style.display = 'none';
            root.querySelector<HTMLElement>('#pTS-script-code-panel')!.style.display = 'none';
            return;
        }
        this.pTS_renderBanner(root);
        this.pTS_renderInstances(root);
        this.pTS_renderVariables(root);
        this.pTS_renderLayersAndCanvas(root);
        this.pTS_renderStateDetails(root);
        this.pTS_renderTransitionDetails(root);
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
        banner.classList.remove('pTS-waiting');
        this.pTS_setText(statusText, '🟢 Live Preview Mode (Runtime Instance Linked)');
        const nodePath = this.pTS_currentState.activeNode?.path || this.pTS_currentState.activeNode?.name || 'Active Node';
        const cls = this.pTS_currentState.controllerClass || 'AnimationController';
        this.pTS_setText(subText, `Controller: ${nodePath} (${cls})`);
    } else {
        banner.classList.add('pTS-waiting');
        this.pTS_setText(statusText, '🟠 Live Preview Mode');
        this.pTS_setText(subText, 'Waiting for runtime AnimationController...');
    }
}

private pTS_setText(element: Element | null, text: string) {
    if (element && element.textContent !== text) element.textContent = text;
}

private pTS_addElement(parent: HTMLElement, tag: string, className = '', text?: string): HTMLElement {
    const element = parent.ownerDocument.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    parent.appendChild(element);
    return element;
}

private pTS_valueText(value: unknown): string {
    if (value && typeof value === 'object') return JSON.stringify(value);
    return String(value ?? '');
}

private pTS_setWidget(element: HTMLElement, value: unknown) {
    // Creator widgets host their editable input in a shadow root. Do not overwrite an in-progress edit.
    if (element.matches(':focus-within')) return;
    const widget = element as HTMLElement & { value: unknown; checked?: boolean };
    if (String(widget.value) !== String(value ?? '')) widget.value = value ?? '';
    if (element.tagName === 'UI-CHECKBOX' && widget.checked !== (value === true)) widget.checked = value === true;
}

private pTS_renderVariables(root: HTMLElement) {
    const container = root.querySelector<HTMLElement>('#pTS-variables-container');
    if (!container) return;
    const variables = this.pTS_currentState?.found ? this.pTS_currentState.variables || [] : [];
    // Values and observation envelopes are not part of the control schema.
    const key = JSON.stringify(variables.map(variable => [variable.name, variable.type, variable.isTrigger]));
    if (key !== this.pTS_variablesKey) {
        this.pTS_variablesKey = key;
        container.replaceChildren();
        if (!variables.length) this.pTS_addElement(container, 'span', '', 'No live variables available');
        for (const variable of variables) {
            const row = this.pTS_addElement(container, 'div', 'pTS-var-row');
            row.dataset.name = variable.name;
            this.pTS_addElement(row, 'span', 'pTS-var-name', variable.name).title = variable.name;
            const holder = this.pTS_addElement(row, 'div', 'pTS-var-widget');
            const tag = variable.isTrigger ? 'ui-button' : variable.type === 1 ? 'ui-checkbox'
                : variable.type === 0 || variable.type === 3 ? 'ui-num-input' : 'span';
            const widget = this.pTS_addElement(holder, tag, 'pTS-variable-value');
            if (variable.isTrigger) {
                widget.textContent = 'Fire Trigger';
                widget.title = 'Trigger resets on the next frame';
            } else if (tag === 'ui-num-input') {
                widget.setAttribute('step', variable.type === 3 ? '1' : '0.1');
            }
            if (tag !== 'span') {
                widget.addEventListener(variable.isTrigger ? 'click' : variable.type === 1 ? 'change' : 'confirm', () => {
                    if (this.pTS_closed || !this.pTS_currentState?.found || !this.pTS_instanceId || this.pTS_subscriptionId === null) return;
                    const input = widget as HTMLElement & { value: unknown; checked?: boolean };
                    const value = variable.isTrigger ? true : variable.type === 1
                        ? input.value === true || input.checked === true : Number(input.value);
                    if (typeof value === 'number' && !Number.isFinite(value)) return;
                    Editor.Message.send('pts-animgraph', 'set-animgraph-variable', {
                        observerId: this.pTS_observerId, uuid: this.pTS_currentAssetUuid,
                        subscriptionId: this.pTS_subscriptionId, instanceId: this.pTS_instanceId,
                        name: variable.name, value,
                    });
                });
            }
        }
    }
    variables.forEach((variable, index) => {
        const widget = container.children[index]?.querySelector<HTMLElement>('.pTS-variable-value');
        if (!widget || variable.isTrigger) return;
        if (widget.tagName === 'SPAN') this.pTS_setText(widget, this.pTS_valueText(variable.value));
        else this.pTS_setWidget(widget, variable.value);
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
        if (layerSelect.value !== String(this.pTS_selectedLayerIndex)) layerSelect.value = String(this.pTS_selectedLayerIndex);
        layerSelect.disabled = layers.length === 0;
    }
    const weightInput = root.querySelector<HTMLElement>('#pTS-layer-weight');
    if (weightInput) {
        const layer = this.pTS_currentState?.found
            ? this.pTS_currentState.layers?.find(item => item.index === layers[this.pTS_selectedLayerIndex]?.index) : undefined;
        weightInput.toggleAttribute('disabled', !layer);
        if (layer) this.pTS_setWidget(weightInput, layer.weight);
    }
    const layer = layers[this.pTS_selectedLayerIndex];
    // Only authored graph geometry/identity can replace graph DOM, never progress or live props.
    const key = JSON.stringify([this.pTS_currentAssetUuid, layer?.index, layer?.stateMachineId,
        layer?.stateMachines.map(machine => [machine.id, machine.name, machine.path,
            machine.states.map(state => [state.id, state.name, state.path, state.type, state.stateMachineId, state.centerX, state.centerY]),
            machine.transitions.map(transition => [transition.id, transition.from, transition.to])])]);
    if (key !== this.pTS_graphKey) {
        this.pTS_graphKey = key;
        this.pTS_graphNodes.clear();
        this.pTS_graphTransitions.clear();
        const container = root.querySelector<HTMLElement>('#pTS-graph-canvas-container');
        if (container) {
            container.replaceChildren();
            if (layer) {
                ++this.pTS_graphRevision;
                const machines = [...layer.stateMachines].sort((a, b) => {
                    if (a.id === layer.stateMachineId) return -1;
                    if (b.id === layer.stateMachineId) return 1;
                    return a.path.localeCompare(b.path);
                });
                machines.forEach((machine, index) => this.pTS_renderMachine(container, layer, machine, index));
            } else {
                this.pTS_addElement(container, 'span', '', 'No state machines available');
            }
        }
    }
    this.pTS_patchGraphState();
}

private pTS_renderMachine(container: HTMLElement, layer: pTS_ILayerDump, machine: pTS_IStateMachineDump, index: number) {
    const card = this.pTS_addElement(container, 'section', 'pTS-machine-card');
    card.dataset.machineId = machine.id;
    card.dataset.machinePath = machine.path;
    const header = this.pTS_addElement(card, 'div', 'pTS-machine-header');
    card.title = 'Automatically centered overview';
    this.pTS_addElement(header, 'span', '',
        `${machine.id === layer.stateMachineId ? 'Root' : 'Nested'} state machine: ${machine.name}`);
    this.pTS_addElement(header, 'span', 'pTS-machine-path', machine.path.split('/').join(' › '));
    const viewport = this.pTS_addElement(card, 'div', 'pTS-machine-viewport');
    const namespace = 'http://www.w3.org/2000/svg';
    const svg = container.ownerDocument.createElementNS(namespace, 'svg');
    svg.setAttribute('class', 'pTS-graph-svg');
    svg.setAttribute('aria-label', `State machine ${machine.path}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    viewport.appendChild(svg);
    const addSvg = (parent: Element, tag: string, attrs: Record<string, string>) => {
        const element = container.ownerDocument.createElementNS(namespace, tag);
        for (const [name, value] of Object.entries(attrs)) element.setAttribute(name, value);
        parent.appendChild(element);
        return element;
    };
    const markerId = `pTS-arrow-${this.pTS_viewId}-${this.pTS_graphRevision}-${index}`;
    const defs = addSvg(svg, 'defs', {});
    for (const [suffix, color] of [['', '#cbd5e1'], ['-hover', '#fff1a8'], ['-selected', '#00e5ff']]) {
        const marker = addSvg(defs, 'marker', {
            id: `${markerId}${suffix}`, viewBox: '0 0 10 10', refX: '10', refY: '5', markerWidth: '6', markerHeight: '6', orient: 'auto',
        });
        addSvg(marker, 'path', { d: 'M 0 0 L 10 5 L 0 10 z', fill: color });
    }
    const positions = new Map(machine.states.map(state => [state.id, {
        x: state.centerX, y: state.centerY, width: Math.max(88, Math.min(200, state.name.length * 7 + 24)), height: 34,
    }]));
    const bounds = [...positions.values()];
    // Coincident authored nodes cannot be separated by scaling; fan out only their display copies.
    const authoredPositions = new Set(bounds.map(position => `${position.x},${position.y}`));
    const displayedPositions = new Set<string>();
    for (const position of bounds) {
        const key = `${position.x},${position.y}`;
        if (displayedPositions.has(key)) {
            do { position.y += position.height + 28; }
            while (authoredPositions.has(`${position.x},${position.y}`) || displayedPositions.has(`${position.x},${position.y}`));
        }
        displayedPositions.add(`${position.x},${position.y}`);
    }
    // Compress unused coordinate gaps, retaining authored ordering within each local machine.
    // These are view copies only; the graph asset and its editor positions are untouched.
    for (const axis of ['x', 'y'] as const) {
        const coordinates = [...new Set(bounds.map(position => position[axis]))].sort((a, b) => a - b);
        const compact = new Map<number, number>();
        let previous = coordinates[0] || 0;
        let offset = 0;
        for (const coordinate of coordinates) {
            offset += Math.min(coordinate - previous, axis === 'x' ? 96 : 72);
            compact.set(coordinate, offset);
            previous = coordinate;
        }
        for (const position of bounds) position[axis] = compact.get(position[axis])!;
    }
    // Expand only enough to prevent node overlap after compaction.
    let spacing = 1;
    for (let a = 0; a < bounds.length; ++a) {
        for (let b = a + 1; b < bounds.length; ++b) {
            const dx = Math.abs(bounds[a].x - bounds[b].x);
            const dy = Math.abs(bounds[a].y - bounds[b].y);
            if (dx || dy) spacing = Math.max(spacing, Math.min(
                dx ? ((bounds[a].width + bounds[b].width) / 2 + 12) / dx : Infinity,
                dy ? ((bounds[a].height + bounds[b].height) / 2 + 12) / dy : Infinity,
            ));
        }
    }
    for (const position of bounds) {
        position.x *= spacing;
        position.y *= spacing;
    }
    const lanes = new Map<string, number>();
    let padding = 28;
    for (const transition of machine.transitions) {
        const key = JSON.stringify([transition.from, transition.to]);
        const lane = lanes.get(key) || 0;
        lanes.set(key, lane + 1);
        padding = Math.max(padding, (transition.from === transition.to ? 65 : 24) + lane * 18 + 12);
    }
    lanes.clear();
    const left = bounds.length ? Math.min(...bounds.map(item => item.x - item.width / 2)) - padding : 0;
    const top = bounds.length ? Math.min(...bounds.map(item => item.y - item.height / 2)) - padding : 0;
    const width = Math.max(260, bounds.length ? Math.max(...bounds.map(item => item.x + item.width / 2)) + padding - left : 260);
    const height = Math.max(180, bounds.length ? Math.max(...bounds.map(item => item.y + item.height / 2)) + padding - top : 180);
    svg.setAttribute('viewBox', `${left} ${top} ${width} ${height}`);
    svg.setAttribute('width', String(width));
    svg.setAttribute('height', String(height));
    const transitions = addSvg(svg, 'g', { class: 'pTS-svg-transitions' });
    for (const transition of machine.transitions) {
        const from = positions.get(transition.from);
        const to = positions.get(transition.to);
        if (!from || !to) continue;
        const laneKey = JSON.stringify([transition.from, transition.to]);
        const lane = lanes.get(laneKey) || 0;
        lanes.set(laneKey, lane + 1);
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const distance = Math.hypot(dx, dy);
        let path: string;
        if (transition.from === transition.to || distance < 1) {
            const lift = 65 + lane * 18;
            path = `M ${from.x - from.width / 4} ${from.y - from.height / 2} C ${from.x - from.width / 2 - lift} ${from.y - lift}, ${to.x + to.width / 2 + lift} ${to.y - lift}, ${to.x + to.width / 4} ${to.y - to.height / 2}`;
        } else {
            const bend = 24 + lane * 18;
            const cx = (from.x + to.x) / 2 - dy / distance * bend;
            const cy = (from.y + to.y) / 2 + dx / distance * bend;
            const border = (position: { x: number; y: number; width: number; height: number }, x: number, y: number) => {
                const scale = 1 / Math.max(Math.abs(x - position.x) / (position.width / 2), Math.abs(y - position.y) / (position.height / 2));
                return { x: position.x + (x - position.x) * scale, y: position.y + (y - position.y) * scale };
            };
            const start = border(from, cx, cy);
            const end = border(to, cx, cy);
            path = `M ${start.x} ${start.y} Q ${cx} ${cy} ${end.x} ${end.y}`;
        }
        const edge = addSvg(transitions, 'g', {
            class: 'pTS-svg-transition', 'data-machine-id': machine.id, 'data-transition-id': transition.id,
            'data-from': transition.from, 'data-to': transition.to,
        }) as SVGGElement;
        edge.style.setProperty('--pTS-arrow-hover', `url(#${markerId}-hover)`);
        edge.style.setProperty('--pTS-arrow-selected', `url(#${markerId}-selected)`);
        const sourceName = machine.states.find(state => state.id === transition.from)?.name || transition.from;
        const destinationName = machine.states.find(state => state.id === transition.to)?.name || transition.to;
        addSvg(edge, 'title', {}).textContent = `${sourceName} → ${destinationName}\n${transition.type}\n${transition.id}`;
        addSvg(edge, 'path', { class: 'pTS-transition-hit', d: path });
        addSvg(edge, 'path', { class: 'pTS-transition-arrow', d: path, 'marker-end': `url(#${markerId})` });
        this.pTS_graphTransitions.set(JSON.stringify([machine.id, transition.id]), edge);
    }
    const nodes = addSvg(svg, 'g', { class: 'pTS-svg-nodes' });
    for (const state of machine.states) {
        const position = positions.get(state.id)!;
        const node = addSvg(nodes, 'g', {
            class: 'pTS-svg-node', 'data-state-id': state.id, 'data-state-path': state.path,
            transform: `translate(${position.x - position.width / 2}, ${position.y - position.height / 2})`,
        }) as SVGGElement;
        const colors: Record<string, [string, string]> = {
            Entry: ['#1b5e20', '#4caf50'], Exit: ['#651b1b', '#f44336'],
            Any: ['#4a148c', '#ab47bc'], SubStateMachine: ['#0f2b48', '#00bcd4'],
        };
        const [fill, stroke] = colors[state.type] || ['#1a365d', '#4a7cb8'];
        addSvg(node, 'title', {}).textContent = `${state.name} (${state.type})\n${state.path}`;
        addSvg(node, 'rect', {
            width: String(position.width), height: String(position.height), rx: '5', fill, stroke, 'stroke-width': '1.5',
        });
        addSvg(node, 'text', {
            x: String(position.width / 2), y: '21', fill: '#fff', 'font-size': '12',
            'font-weight': '600', 'text-anchor': 'middle', 'pointer-events': 'none',
        }).textContent = state.name.length > 25 ? `${state.name.slice(0, 24)}…` : state.name;
        this.pTS_graphNodes.set(state.id, { element: node, path: state.path });
    }
    if (!machine.states.length) addSvg(svg, 'text', { x: '20', y: '40', fill: '#aaa', 'font-size': '12' }).textContent = 'No local states';
}

private pTS_patchGraphState() {
    const layer = this.pTS_currentDump?.layers[this.pTS_selectedLayerIndex];
    const activePath = this.pTS_currentState?.found
        ? this.pTS_currentState.layers?.find(item => item.index === layer?.index)?.activeStatePath || '' : '';
    for (const [id, node] of this.pTS_graphNodes) {
        const flags: Record<string, boolean> = {
            'pTS-selected': id === this.pTS_selectedState?.id,
            'pTS-active-glow': !!activePath && activePath === node.path,
            'pTS-active-ancestor': !!activePath && !!node.path && activePath.startsWith(`${node.path}/`),
        };
        for (const [name, enabled] of Object.entries(flags)) {
            if (node.element.classList.contains(name) !== enabled) node.element.classList.toggle(name, enabled);
        }
    }
    const selectedEdgeKey = this.pTS_selectedTransition
        ? JSON.stringify([this.pTS_selectedTransition.machineId, this.pTS_selectedTransition.id]) : '';
    for (const [key, element] of this.pTS_graphTransitions) {
        const selected = key === selectedEdgeKey;
        if (element.classList.contains('pTS-selected') !== selected) element.classList.toggle('pTS-selected', selected);
    }
}

private pTS_renderTransitionDetails(root: HTMLElement) {
    const card = root.querySelector<HTMLElement>('#pTS-transition-details-card');
    const content = root.querySelector<HTMLElement>('#pTS-transition-details-content');
    if (!card || !content) return;
    const selected = this.pTS_findTransition(this.pTS_selectedTransition);
    if (!selected) {
        this.pTS_transitionDetailsKey = '';
        if (card.style.display !== 'none') card.style.display = 'none';
        if (card.dataset.transitionId !== undefined) delete card.dataset.transitionId;
        if (card.dataset.machineId !== undefined) delete card.dataset.machineId;
        return;
    }
    const { machine, transition } = selected;
    const source = machine.states.find(state => state.id === transition.from);
    const destination = machine.states.find(state => state.id === transition.to);
    if (card.style.display !== 'flex') card.style.display = 'flex';
    if (card.dataset.transitionId !== transition.id) card.dataset.transitionId = transition.id;
    if (card.dataset.machineId !== machine.id) card.dataset.machineId = machine.id;
    // Authored data only: progress pushes must not rebuild the panel or reset its scroll/selection.
    const key = JSON.stringify([this.pTS_currentAssetUuid, this.pTS_selectedLayerIndex, machine.id, machine.path,
        transition, source?.name, destination?.name]);
    if (key === this.pTS_transitionDetailsKey) return;
    this.pTS_transitionDetailsKey = key;
    content.replaceChildren();
    const arrowTitle = `${source?.name || transition.from} ────────► ${destination?.name || transition.to}`;
    const summary = this.pTS_addElement(content, 'div', 'pTS-transition-summary', arrowTitle);
    summary.dataset.field = 'endpoints';
    const metaCard = this.pTS_addElement(content, 'div', 'pTS-sub-card');
    const metaRow = this.pTS_addElement(metaCard, 'div', 'pTS-prop-row');
    metaRow.dataset.property = 'machine';
    this.pTS_addElement(metaRow, 'span', 'pTS-prop-label', 'Machine').title = 'machine';
    const metaHolder = this.pTS_addElement(metaRow, 'div', 'pTS-prop-val');
    const metaInput = this.pTS_addElement(metaHolder, 'ui-input');
    metaInput.setAttribute('disabled', '');
    this.pTS_setWidget(metaInput, machine.path);
    const configuration = this.pTS_addElement(content, 'div', 'pTS-sub-card');
    configuration.dataset.fields = 'transition';
    this.pTS_addElement(configuration, 'div', 'pTS-sub-title', 'Configured transition fields');
    this.pTS_renderTransitionProperties(configuration, { duration: transition.duration, ...transition.properties });
    this.pTS_addElement(content, 'div', 'pTS-condition-note', transition.hasExitCondition
        ? 'Exit gating enabled: animation source exit time must also be reached; see the configured exit threshold above.'
        : 'Exit gating disabled: no animation exit-time gate.').dataset.field = 'exit-gating';
    const conditions = transition.conditions;
    const heading = this.pTS_addElement(content, 'div', 'pTS-sub-title',
        conditions.length ? `Conditions (${conditions.length}) · AND — all must pass` : 'Conditions (0)');
    heading.dataset.field = 'conditions-summary';
    if (!conditions.length) {
        const entryOrExit = source?.type === 'Entry' || source?.type === 'Exit';
        this.pTS_addElement(content, 'div', 'pTS-condition-note', entryOrExit
            ? 'No conditions configured. Entry/Exit transitions can be taken without conditions.'
            : transition.hasExitCondition
                ? 'No conditions configured. Eligibility depends on the enabled exit gate, not an unconditional match.'
                : 'No conditions configured and exit gating is disabled. Outside Entry/Exit, the engine ignores this transition.'
        ).dataset.field = 'empty-conditions';
    }
    conditions.forEach((condition, index) => {
        const section = this.pTS_addElement(content, 'div', 'pTS-sub-card');
        section.dataset.conditionIndex = String(index);
        section.dataset.conditionType = condition.type;
        this.pTS_addElement(section, 'div', 'pTS-sub-title', `${index + 1}. ${condition.type}`);
        this.pTS_renderTransitionProperties(section, condition.properties, condition.enumLabels);
    });
    this.pTS_addElement(content, 'div', 'pTS-condition-note',
        'Configured rules only, not live pass/fail evaluation. Other outgoing transitions and engine transition ordering still apply.');
}

private pTS_renderTransitionProperties(parent: HTMLElement, properties: Record<string, unknown>, enumLabels: Record<string, string> = {}, prefix = '') {
    const fields = this.pTS_addElement(parent, 'div', 'pTS-transition-fields');
    const entries = Object.entries(properties);
    if (!entries.length) this.pTS_addElement(fields, 'span', 'pTS-condition-note', 'No configured properties');
    for (const [name, value] of entries) {
        const path = prefix ? `${prefix}.${name}` : name;
        const row = this.pTS_addElement(fields, 'div', 'pTS-prop-row');
        row.dataset.property = path;
        this.pTS_addElement(row, 'span', 'pTS-prop-label', name).title = path;
        const holder = this.pTS_addElement(row, 'div', 'pTS-prop-val');
        if (value !== null && typeof value === 'object' && Object.keys(value).length) {
            this.pTS_addElement(holder, 'span', '', Array.isArray(value) ? `Array (${value.length})` : 'Object');
            const children = this.pTS_addElement(fields, 'div', 'pTS-transition-property-children');
            this.pTS_renderTransitionProperties(children, value as Record<string, unknown>, enumLabels, path);
        } else {
            const label = enumLabels[path];
            if (label) {
                const select = this.pTS_addElement(holder, 'ui-select');
                select.setAttribute('disabled', '');
                const option = this.pTS_addElement(select, 'option', '', label) as HTMLOptionElement;
                option.value = String(value);
                option.selected = true;
                select.title = `${label} (${String(value)})`;
                this.pTS_setWidget(select, value);
            } else if (typeof value === 'number' || typeof value === 'boolean') {
                const widget = this.pTS_addElement(holder, typeof value === 'number' ? 'ui-num-input' : 'ui-checkbox');
                widget.setAttribute('disabled', '');
                this.pTS_setWidget(widget, value);
            } else if (typeof value === 'string') {
                const widget = this.pTS_addElement(holder, 'ui-input');
                widget.setAttribute('disabled', '');
                this.pTS_setWidget(widget, value);
            } else {
                this.pTS_addElement(holder, 'span', '', value === null ? 'null' : this.pTS_valueText(value));
            }
        }
    }
}

private pTS_clearDetails() {
    if (this.pTS_scriptKey) {
        ++this.pTS_scriptVersion;
        this.pTS_scriptKey = '';
    }
    this.pTS_detailsKey = '';
    this.pTS_detailUpdates = [];
}

private pTS_renderStateDetails(root: HTMLElement) {
    const card = root.querySelector<HTMLElement>('#pTS-state-details-card');
    const content = root.querySelector<HTMLElement>('#pTS-state-details-content');
    const scriptPanel = root.querySelector<HTMLElement>('#pTS-script-code-panel');
    if (!card || !content || !scriptPanel) return;
    const state = this.pTS_selectedState;
    if (!state) {
        this.pTS_clearDetails();
        card.style.display = 'none';
        scriptPanel.style.display = 'none';
        return;
    }
    card.style.display = 'flex';
    this.pTS_setText(root.querySelector('#pTS-state-title-text'), `State: ${state.name} (${state.path})`);
    const components = state.components || [];
    const key = JSON.stringify([this.pTS_currentAssetUuid, this.pTS_selectedLayerIndex, state.id,
        components.map(component => [component.className, Object.keys(component.props), component.attrs])]);
    if (key !== this.pTS_detailsKey) {
        this.pTS_detailsKey = key;
        this.pTS_detailUpdates = [];
        content.replaceChildren();
        const general = this.pTS_addElement(content, 'div', 'pTS-sub-card');
        const addValue = (parent: HTMLElement, name: string, getValue: () => unknown, attr: Record<string, unknown> = {}) => {
            const row = this.pTS_addElement(parent, 'div', 'pTS-prop-row');
            row.dataset.property = name;
            this.pTS_addElement(row, 'span', 'pTS-prop-label', name).title = name;
            const holder = this.pTS_addElement(row, 'div', 'pTS-prop-val');
            // Keep controls even if a runtime value becomes unavailable or changes type.
            const number = this.pTS_addElement(holder, 'ui-num-input');
            const boolean = this.pTS_addElement(holder, 'ui-checkbox');
            const enumSelect = this.pTS_addElement(holder, 'ui-select');
            const text = this.pTS_addElement(holder, 'span');
            for (const widget of [number, boolean, enumSelect]) widget.setAttribute('disabled', '');
            if (attr.type === 'Enum' && Array.isArray(attr.enumList)) {
                for (const item of attr.enumList as Array<{ name?: string; value?: unknown }>) {
                    const option = this.pTS_addElement(enumSelect, 'option', '', item.name || '') as HTMLOptionElement;
                    option.value = String(item.value ?? '');
                }
            }
            let previous = '';
            this.pTS_detailUpdates.push(() => {
                const value = getValue();
                const next = JSON.stringify([value === undefined, value]);
                if (next === previous) return;
                previous = next;
                const active = value === undefined ? text : attr.type === 'Enum' && Array.isArray(attr.enumList)
                    ? enumSelect : typeof value === 'number' ? number : typeof value === 'boolean' ? boolean : text;
                for (const widget of [number, boolean, enumSelect, text]) widget.style.display = widget === active ? '' : 'none';
                if (active === text) {
                    const asset = value && typeof value === 'object' && 'uuid' in value ? value.uuid : undefined;
                    this.pTS_setText(text, value === undefined ? 'Runtime value unavailable' : this.pTS_valueText(asset ?? value));
                } else this.pTS_setWidget(active, value);
            });
        };
        addValue(general, 'Speed', () => this.pTS_selectedState?.speed);
        addValue(general, 'Speed Multiplier', () => this.pTS_selectedState?.speedMultiplierEnabled);
        addValue(general, 'Clip', () => this.pTS_selectedState?.clipName || 'No animation clip');
        components.forEach((component, index) => {
            const subcard = this.pTS_addElement(content, 'div', 'pTS-sub-card');
            subcard.dataset.component = component.className;
            this.pTS_addElement(subcard, 'div', 'pTS-sub-title', component.className);
            const names = Object.keys(component.props);
            if (!names.length) this.pTS_addElement(subcard, 'span', '', '(No serialized properties)');
            for (const name of names) {
                addValue(subcard, name, () => {
                    const selected = this.pTS_selectedState;
                    const currentComponent = selected?.components[index];
                    const stateComponents = selected && this.pTS_currentState?.found ? this.pTS_currentState.components?.[selected.path] : undefined;
                    const live = currentComponent && stateComponents ? stateComponents[currentComponent.className] : undefined;
                    const liveProps = live && typeof live === 'object' ? live as Record<string, unknown> : null;
                    return liveProps && Object.prototype.hasOwnProperty.call(liveProps, name) ? liveProps[name] : undefined;
                }, component.attrs[name] || {});
            }
        });
    }
    for (const patch of this.pTS_detailUpdates) patch();
    if (components[0]?.className) void this.pTS_renderScriptCode(root, components[0].className);
    else {
        if (this.pTS_scriptKey) ++this.pTS_scriptVersion;
        this.pTS_scriptKey = '';
        scriptPanel.style.display = 'none';
    }
}

private async pTS_renderScriptCode(root: HTMLElement, className: string) {
    const scriptPanel = root.querySelector<HTMLElement>('#pTS-script-code-panel');
    const headerTitle = root.querySelector<HTMLElement>('#pTS-script-header-title');
    const codeDisplay = root.querySelector<HTMLElement>('#pTS-script-display');
    if (!scriptPanel || !headerTitle || !codeDisplay) return;
    const key = JSON.stringify([this.pTS_currentAssetUuid, this.pTS_instanceId, this.pTS_selectedLayerIndex, this.pTS_selectedState?.id, className]);
    if (this.pTS_scriptKey === key) return;
    this.pTS_scriptKey = key;
    const version = ++this.pTS_scriptVersion;
    const observation = this.pTS_observerId;
    scriptPanel.style.display = 'flex';
    this.pTS_setText(headerTitle, `${className}.ts`);
    this.pTS_setText(codeDisplay, '// Loading TypeScript source...');
    try {
        const result = await Editor.Message.request('pts-animgraph', 'get-component-script', { className });
        if (this.pTS_closed || version !== this.pTS_scriptVersion || observation !== this.pTS_observerId || key !== this.pTS_scriptKey) return;
        const scriptName = result && typeof result === 'object' && 'scriptName' in result && typeof result.scriptName === 'string'
            ? result.scriptName : `${className}.ts`;
        const source = result && typeof result === 'object' && 'content' in result && typeof result.content === 'string'
            ? result.content : `// Source file for ${className} not found in project assets.`;
        this.pTS_setText(headerTitle, scriptName);
        this.pTS_setText(codeDisplay, source);
    } catch (error) {
        if (this.pTS_closed || version !== this.pTS_scriptVersion || observation !== this.pTS_observerId || key !== this.pTS_scriptKey) return;
        this.pTS_setText(codeDisplay, `// Error loading script for ${className}: ${String(error)}`);
    }
}
}
