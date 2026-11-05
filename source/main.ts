import fs from 'fs';
import path from 'path';

interface pTSEditorGlobal {
    Project: { path: string };
    Dialog?: {
        warn(title: string, options: { detail: string; buttons: string[]; default: number; cancel: number }): Promise<number | boolean | { response: number }>;
    };
    Panel: {
        open(panelId: string): Promise<void>;
    };
    Message: {
        broadcast(channel: string, payload: unknown): void;
        request(pkg: string, method: string, ...args: unknown[]): Promise<unknown>;
    };
}

declare const Editor: pTSEditorGlobal;

const pTSPackageJsonPath = path.join(__dirname, '../package.json');
let pTSPackageJson: { name: string; version: string; author: string } = { name: 'pts-animgraph', version: '1.0.0', author: 'pTSern' };
try {
    if (fs.existsSync(pTSPackageJsonPath)) {
        pTSPackageJson = JSON.parse(fs.readFileSync(pTSPackageJsonPath, 'utf8'));
    }
} catch (e) {}

function pTS_openUrl(url: string) {
    try {
        const { shell } = require('electron');
        if (shell && typeof shell.openExternal === 'function') {
            shell.openExternal(url);
            return;
        }
    } catch {}
    try {
        const { exec } = require('child_process');
        if (process.platform === 'win32') {
            exec(`start "" "${url}"`);
        } else if (process.platform === 'darwin') {
            exec(`open "${url}"`);
        } else {
            exec(`xdg-open "${url}"`);
        }
    } catch (e) {
        console.error('[pTS-AnimGraph] Failed to open URL:', url, e);
    }
}

export async function pTS_checkPtsCoreDependency(showDialog = true): Promise<boolean> {
    try {
        const coreDir = path.join(Editor.Project.path, 'extensions', 'pts-core');
        const pkgFile = path.join(coreDir, 'package.json');
        const isInstalled = fs.existsSync(pkgFile);

        if (!isInstalled) {
            console.error(`[${pTSPackageJson.name}] ⚠️ Missing HARD Dependency: 'pts-core' was not found in ${coreDir}.`);

            if (showDialog && Editor.Dialog && typeof Editor.Dialog.warn === 'function') {
                const res = await Editor.Dialog.warn(`[${pTSPackageJson.name}] Missing Hard Dependency: pts-core`, {
                    detail: `The extension "${pTSPackageJson.name}" has a HARD DEPENDENCY on "pts-core".\n\nWithout "pts-core", anim-graph inspection, reflection, and live runtime telemetry will not operate.\n\nPlease install "pts-core" from GitHub.`,
                    buttons: ['Install pts-core (GitHub)', 'Cancel'],
                    default: 0,
                    cancel: 1
                });

                const isConfirmed = res === 0 || (res && typeof res === 'object' && res.response === 0) || res === true;
                if (isConfirmed) {
                    pTS_openUrl('https://github.com/pTSern/pts-core');
                }
            }
            return false;
        }
        return true;
    } catch (e) {
        console.error(`[${pTSPackageJson.name}] Error checking pts-core dependency:`, e);
        return false;
    }
}

export interface pTS_IAnimGraphVariable {
    name: string;
    type: number;
    typeName: string;
    value: unknown;
    isTrigger: boolean;
}

export interface pTS_IAnimGraphLayerStatus {
    index: number;
    name: string;
    weight: number;
    activeStatePath: string | null;
    progress: number;
}

export interface pTS_IStateComponentDump {
    className: string;
    props: Record<string, unknown>;
    attrs: Record<string, Record<string, unknown>>;
}

export interface pTS_IStateDump {
    name: string;
    id: string;
    path: string;
    stateMachineId: string | null;
    type: string;
    centerX: number;
    centerY: number;
    speed: number;
    speedMultiplier: string;
    speedMultiplierEnabled: boolean;
    clipName: string | null;
    clipUuid: string | null;
    components: pTS_IStateComponentDump[];
}

export interface pTS_IConditionDump {
    type: string;
    properties: Record<string, unknown>;
    enumLabels: Record<string, string>;
}

export interface pTS_ITransitionDump {
    id: string;
    type: string;
    properties: Record<string, unknown>;
    conditions: pTS_IConditionDump[];
    from: string;
    to: string;
    duration: number;
    hasExitCondition: boolean;
}

export interface pTS_IStateMachineDump {
    id: string;
    name: string;
    path: string;
    states: pTS_IStateDump[];
    transitions: pTS_ITransitionDump[];
}

export interface pTS_ILayerDump {
    index: number;
    name: string;
    weight: number;
    additive: boolean;
    mask: boolean;
    stateMachineId: string;
    stateMachines: pTS_IStateMachineDump[];
}

export interface pTS_IGraphDump {
    uuid: string;
    name: string;
    layerCount: number;
    layers: pTS_ILayerDump[];
    variables: pTS_IAnimGraphVariable[];
}

export interface pTS_IAnimGraphInstance {
    id: string;
    nodeUuid: string;
    path: string;
    controllerClass: string;
}

export interface pTS_IAnimGraphState {
    isPreview: boolean;
    found: boolean;
    uuid: string;
    instances: pTS_IAnimGraphInstance[];
    instanceId: string | null;
    subscriptionId?: number;
    dump?: pTS_IGraphDump | null;
    activeNode?: { name: string; uuid: string; path: string };
    controllerClass?: string;
    variables?: pTS_IAnimGraphVariable[];
    layers?: pTS_IAnimGraphLayerStatus[];
    components?: Record<string, Record<string, unknown>>;
}

export interface pTS_IPreviewObservation {
    observerId: string;
    uuid: string;
    subscriptionId: number;
    instanceId: string | null;
    state: pTS_IAnimGraphState;
    fingerprint?: string;
}

interface pTS_IPreviewContents {
    id: number;
    getURL(): string;
    isDestroyed(): boolean;
    send(channel: string, payload?: unknown): void;
    once(channel: 'destroyed', listener: () => void): void;
    removeListener(channel: 'destroyed', listener: () => void): void;
}

interface pTS_IPreviewSessionEvent { sender: pTS_IPreviewContents; }
interface pTS_IPreviewElectron {
    ipcMain: {
        on(channel: string, listener: (event: pTS_IPreviewSessionEvent, payload: unknown) => void): void;
        removeListener(channel: string, listener: (event: pTS_IPreviewSessionEvent, payload: unknown) => void): void;
    };
    webContents: { getAllWebContents(): pTS_IPreviewContents[] };
}

const pTS_previewObservations = new Map<string, pTS_IPreviewObservation>();
let pTS_previewSessionId: string | null = null;
let pTS_previewSubscriptionId = 0;
let pTS_previewElectron: pTS_IPreviewElectron | null = null;
let pTS_previewContents: pTS_IPreviewContents | null = null;
const pTS_retiredPreviewSessions = new Set<string>();
// Matches Cocos Creator 3.8.8 cocos/animation/marionette/variable/basic.ts.
const pTS_variableTypeNames = ['Float', 'Boolean', 'Trigger', 'Integer', 'Vec3', 'Quat'];

export function pTS_parseAnimGraphFile(filePath: string): pTS_IGraphDump | null {
    try {
        const raw = fs.readFileSync(filePath, 'utf8');
        const objects: unknown = JSON.parse(raw);
        if (!Array.isArray(objects)) return null;
        const objectIds = new Map<object, number>();
        objects.forEach((object: unknown, index: number) => {
            if (object && typeof object === 'object') objectIds.set(object, index);
        });
        const getObj = (ref: unknown): Record<string, unknown> | null => {
            if (!ref || typeof ref !== 'object') return null;
            const object = '__id__' in ref && typeof ref.__id__ === 'number' ? objects[ref.__id__] : ref;
            return object && typeof object === 'object' && !Array.isArray(object)
                ? object as Record<string, unknown> : null;
        };
        const inlineIds = new Map<object, number>();
        const getId = (kind: string, object: object): string => {
            const index = objectIds.get(object);
            if (index !== undefined) return `${kind}:${index}`;
            if (!inlineIds.has(object)) inlineIds.set(object, inlineIds.size);
            return `${kind}:inline:${inlineIds.get(object)}`;
        };
        const root = getObj(objects[0]);
        if (!root || root.__type__ !== 'cc.animation.AnimationGraph') return null;
        // Enum values come from Creator 3.8.8's binary-condition.ts and unary-condition.ts.
        const pTS_conditionOperators: Record<string, readonly string[]> = {
            'cc.animation.BinaryCondition': [
                'EQUAL_TO', 'NOT_EQUAL_TO', 'LESS_THAN', 'LESS_THAN_OR_EQUAL_TO',
                'GREATER_THAN', 'GREATER_THAN_OR_EQUAL_TO',
            ],
            'cc.animation.UnaryCondition': ['TRUTHY', 'FALSY'],
        };
        const pTS_transitionFields: Record<string, true> = { from: true, to: true, conditions: true };
        const pTS_cloneAuthored = (value: unknown, ancestors = new Set<object>(), depth = 0): unknown => {
            if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
            if (typeof value === 'number') return Number.isFinite(value) ? value : String(value);
            if (!value || typeof value !== 'object') return null;
            const resolved = !Array.isArray(value) && '__id__' in value && typeof value.__id__ === 'number'
                ? objects[value.__id__] : value;
            if (!resolved || typeof resolved !== 'object') return null;
            if (ancestors.has(resolved)) return '[Circular]';
            if (depth >= 16) return '[Max depth]';
            ancestors.add(resolved);
            let clone: unknown;
            if (Array.isArray(resolved)) {
                clone = resolved.map((item) => pTS_cloneAuthored(item, ancestors, depth + 1));
            } else {
                const properties: Record<string, unknown> = {};
                for (const [key, item] of Object.entries(resolved)) {
                    if (key.startsWith('__') && key !== '__type__' && key !== '__uuid__') continue;
                    properties[key] = pTS_cloneAuthored(item, ancestors, depth + 1);
                }
                clone = properties;
            }
            ancestors.delete(resolved);
            return clone;
        };
        const pTS_authoredProperties = (
            object: Record<string, unknown>, excluded: Record<string, true> = {},
        ): Record<string, unknown> => {
            const properties: Record<string, unknown> = {};
            const ancestors = new Set<object>([object]);
            for (const [key, value] of Object.entries(object)) {
                if (key.startsWith('__') || Object.prototype.hasOwnProperty.call(excluded, key)) continue;
                properties[key] = pTS_cloneAuthored(value, ancestors);
            }
            return properties;
        };
        const pTS_conditionDump = (condition: Record<string, unknown>): pTS_IConditionDump => {
            const type = typeof condition.__type__ === 'string' ? condition.__type__ : '';
            const properties = pTS_authoredProperties(condition);
            const enumLabels: Record<string, string> = {};
            const collectLabels = (value: unknown, valueType: string, path: string): void => {
                if (!value || typeof value !== 'object') return;
                const object = value as Record<string, unknown>;
                const operator = object.operator;
                const labels = pTS_conditionOperators[valueType];
                if (labels && typeof operator === 'number' && Number.isInteger(operator) && labels[operator]) {
                    enumLabels[`${path}operator`] = labels[operator];
                }
                for (const [key, nested] of Object.entries(object)) {
                    const nestedType = nested && typeof nested === 'object' && '__type__' in nested
                        && typeof nested.__type__ === 'string' ? nested.__type__ : '';
                    collectLabels(nested, nestedType, `${path}${key}.`);
                }
            };
            collectLabels(properties, type, '');
            return { type, properties, enumLabels };
        };
        const pTS_inlineTransitionIds = new Map<object, number>();
        const pTS_transitionId = (transition: object): string => {
            const index = objectIds.get(transition);
            if (index !== undefined) return `transition:${index}`;
            if (!pTS_inlineTransitionIds.has(transition)) {
                pTS_inlineTransitionIds.set(transition, pTS_inlineTransitionIds.size);
            }
            return `transition:inline:${pTS_inlineTransitionIds.get(transition)}`;
        };

        const layers: pTS_ILayerDump[] = [];
        const rawLayers = Array.isArray(root._layers) ? root._layers : [];
        rawLayers.forEach((lRef: unknown, lIdx: number) => {
            const lObj = getObj(lRef);
            if (!lObj) return;
            const rootMachine = getObj(lObj._stateMachine);
            if (!rootMachine) return;
            const layerName = typeof lObj.name === 'string' ? lObj.name : `Layer ${lIdx}`;
            const stateMachines: pTS_IStateMachineDump[] = [];
            const pending = [{ object: rootMachine, name: layerName, path: layerName }];
            const visited = new Set<object>();
            for (let index = 0; index < pending.length; index++) {
                const { object: sm, name, path: machinePath } = pending[index];
                if (visited.has(sm)) continue;
                visited.add(sm);
                const machine: pTS_IStateMachineDump = {
                    id: getId('machine', sm), name, path: machinePath, states: [], transitions: [],
                };
                stateMachines.push(machine);
                const rawStates = Array.isArray(sm._states) ? sm._states : [];
                const stateIds = new Map<object, string>();
                const entryState = getObj(sm._entryState);
                const exitState = getObj(sm._exitState);
                const anyState = getObj(sm._anyState);
                for (const stRef of rawStates) {
                    const st = getObj(stRef);
                    if (!st) continue;
                    const stateName = typeof st.name === 'string' ? st.name : '';
                    const statePath = `${machinePath}/${stateName}`;
                    const className = typeof st.__type__ === 'string' ? st.__type__ : '';
                    const type = st === entryState ? 'Entry' : st === exitState ? 'Exit' : st === anyState ? 'Any'
                        : className === 'cc.animation.SubStateMachine' ? 'SubStateMachine'
                            : className === 'cc.animation.Motion' ? 'Motion'
                                : className === 'cc.animation.EmptyState' ? 'Empty'
                                    : className === 'cc.animation.ProceduralPoseState' ? 'ProceduralPose'
                                        : className.slice(className.lastIndexOf('.') + 1);
                    const nested = type === 'SubStateMachine' ? getObj(st._stateMachine) : null;
                    const extras = getObj(st.__editorExtras__) || {};
                    const comps: pTS_IStateComponentDump[] = [];
                    const rawComps = Array.isArray(st._components) ? st._components : [];
                    for (const cRef of rawComps) {
                        const c = getObj(cRef);
                        if (!c) continue;
                        const props: Record<string, unknown> = {};
                        for (const [key, val] of Object.entries(c)) {
                            if (!key.startsWith('__') && key !== '_objFlags' && key !== '_id' && key !== '_name') {
                                props[key] = pTS_cloneAuthored(val);
                            }
                        }
                        comps.push({
                            className: typeof c.__type__ === 'string' ? c.__type__ : '',
                            props, attrs: {},
                        });
                    }
                    const motionObj = getObj(st.motion);
                    const clipObj = motionObj ? getObj(motionObj.clip) : null;
                    const id = getId('state', st);
                    stateIds.set(st, id);
                    machine.states.push({
                        name: stateName,
                        id,
                        path: statePath,
                        stateMachineId: nested ? getId('machine', nested) : null,
                        type,
                        centerX: typeof extras.centerX === 'number' ? extras.centerX : 0,
                        centerY: typeof extras.centerY === 'number' ? extras.centerY : 0,
                        speed: typeof st.speed === 'number' ? st.speed : 1,
                        speedMultiplier: typeof st.speedMultiplier === 'string' ? st.speedMultiplier : '',
                        speedMultiplierEnabled: !!st.speedMultiplierEnabled,
                        clipName: typeof clipObj?._name === 'string' ? clipObj._name
                            : typeof clipObj?.name === 'string' ? clipObj.name : null,
                        clipUuid: typeof clipObj?.__uuid__ === 'string' ? clipObj.__uuid__ : null,
                        components: comps,
                    });
                    if (nested) pending.push({ object: nested, name: stateName, path: statePath });
                }
                const rawTransitions = Array.isArray(sm._transitions) ? sm._transitions : [];
                for (const trRef of rawTransitions) {
                    const tr = getObj(trRef);
                    if (!tr) continue;
                    const fromObj = getObj(tr.from);
                    const toObj = getObj(tr.to);
                    const from = fromObj ? stateIds.get(fromObj) : undefined;
                    const to = toObj ? stateIds.get(toObj) : undefined;
                    // A malformed cross-machine reference must never become a same-name edge.
                    if (from === undefined || to === undefined) continue;
                    machine.transitions.push({
                        id: pTS_transitionId(tr),
                        type: typeof tr.__type__ === 'string' ? tr.__type__ : '',
                        properties: pTS_authoredProperties(tr, pTS_transitionFields),
                        conditions: (Array.isArray(tr.conditions) ? tr.conditions : [])
                            .map(getObj).filter((condition): condition is Record<string, unknown> => !!condition)
                            .map(pTS_conditionDump),
                        from, to,
                        duration: typeof tr.duration === 'number' ? tr.duration : 0,
                        hasExitCondition: !!tr.exitConditionEnabled,
                    });
                }
            }
            layers.push({
                index: lIdx,
                name: layerName,
                weight: typeof lObj.weight === 'number' ? lObj.weight : 1.0,
                additive: !!lObj.additive,
                mask: !!lObj.mask,
                stateMachineId: getId('machine', rootMachine),
                stateMachines,
            });
        });

        const variables: pTS_IAnimGraphVariable[] = [];
        if (root._variables && typeof root._variables === 'object') {
            for (const [vName, vRef] of Object.entries(root._variables as Record<string, unknown>)) {
                const vObj = getObj(vRef);
                if (!vObj) continue;
                const className = typeof vObj.__type__ === 'string' ? vObj.__type__ : '';
                const typeNum = typeof vObj._type === 'number' ? vObj._type
                    : className === 'cc.animation.TriggerVariable' ? 2
                        : className === 'cc.animation.Vec3Variable' ? 4
                            : className === 'cc.animation.QuatVariable' ? 5 : 0;
                variables.push({
                    name: vName,
                    type: typeNum,
                    typeName: pTS_variableTypeNames[typeNum] || 'Unknown',
                    value: typeNum === 2 ? !!(Number(vObj._flags) & 1)
                        : typeNum === 4 || typeNum === 5 ? getObj(vObj._value)
                            : vObj._value !== undefined ? vObj._value : false,
                    isTrigger: typeNum === 2
                });
            }
        }

        return {
            uuid: '',
            name: typeof root._name === 'string' ? root._name : path.basename(filePath, '.animgraph'),
            layerCount: layers.length,
            layers,
            variables
        };
    } catch (e) {
        console.error('[pTS-AnimGraph] Error parsing animgraph file:', filePath, e);
        return null;
    }
}

function pTS_isPreviewContents(contents: pTS_IPreviewContents): boolean {
    try {
        return !contents.isDestroyed() && /[\\/]preload[\\/](?:web|native)[\\/]preview\.js$/i.test(decodeURIComponent(contents.getURL()));
    } catch {
        return false;
    }
}

function pTS_requestPreviewSession() {
    for (const contents of pTS_previewElectron?.webContents.getAllWebContents() || []) {
        if (pTS_isPreviewContents(contents)) contents.send('pts-animgraph:request-preview-session');
    }
}

function pTS_broadcastObservation(observation: pTS_IPreviewObservation) {
    Editor.Message.broadcast('pts-animgraph:data-changed', {
        observerId: observation.observerId,
        uuid: observation.uuid,
        subscriptionId: observation.subscriptionId,
        instanceId: observation.instanceId,
        state: observation.state,
    });
}

function pTS_endPreviewSession() {
    if (pTS_previewSessionId) pTS_retiredPreviewSessions.add(pTS_previewSessionId);
    pTS_previewContents?.removeListener('destroyed', pTS_endPreviewSession);
    pTS_previewSessionId = null;
    pTS_previewContents = null;
    for (const observation of pTS_previewObservations.values()) {
        observation.state = {
            isPreview: false, found: false, uuid: observation.uuid,
            instances: [], instanceId: observation.instanceId,
            subscriptionId: observation.subscriptionId, dump: observation.state.dump,
        };
        observation.fingerprint = undefined;
        pTS_broadcastObservation(observation);
    }
}

function pTS_receivePreviewSession(event: pTS_IPreviewSessionEvent, value: unknown) {
    if (!pTS_isPreviewContents(event.sender)) return;
    const session = value as { sessionId?: string; running?: boolean };
    if (!session || typeof session.sessionId !== 'string' || !session.sessionId || typeof session.running !== 'boolean') return;
    if (!session.running) {
        if (pTS_previewContents === event.sender && pTS_previewSessionId === session.sessionId) pTS_endPreviewSession();
        return;
    }
    if (pTS_retiredPreviewSessions.has(session.sessionId)) return;
    if (pTS_previewContents !== event.sender || pTS_previewSessionId !== session.sessionId) {
        for (const observation of pTS_previewObservations.values()) pTS_sendObservation(observation, true);
        pTS_endPreviewSession();
        pTS_previewContents = event.sender;
        pTS_previewSessionId = session.sessionId;
        pTS_previewContents.once('destroyed', pTS_endPreviewSession);
    }
    for (const observation of pTS_previewObservations.values()) pTS_sendObservation(observation);
}
function pTS_enrichDumpWithSceneData(authoring: pTS_IGraphDump, scene: pTS_IGraphDump): void {
    if (!authoring || !scene || !Array.isArray(authoring.layers) || !Array.isArray(scene.layers)) return;
    for (let l = 0; l < authoring.layers.length; l++) {
        const authLayer = authoring.layers[l];
        const sceneLayer = scene.layers.find(sl => sl.index === authLayer.index || sl.name === authLayer.name);
        if (!sceneLayer) continue;
        for (const authSm of authLayer.stateMachines) {
            const sceneSm = sceneLayer.stateMachines.find(sm => sm.name === authSm.name || sm.path === authSm.path);
            if (!sceneSm) continue;
            for (const authSt of authSm.states) {
                const sceneSt = sceneSm.states.find(st => st.name === authSt.name || st.path === authSt.path);
                if (!sceneSt) continue;
                if (!authSt.components.length && sceneSt.components.length) {
                    authSt.components = sceneSt.components;
                } else {
                    for (const authComp of authSt.components) {
                        const sceneComp = sceneSt.components.find(c => c.className === authComp.className);
                        if (!sceneComp) continue;
                        authComp.attrs = { ...sceneComp.attrs, ...authComp.attrs };
                        authComp.props = { ...sceneComp.props, ...authComp.props };
                    }
                }
            }
        }
    }
}


function pTS_sendObservation(observation: pTS_IPreviewObservation, unsubscribe = false) {
    if (!pTS_previewContents || pTS_previewContents.isDestroyed() || !pTS_previewSessionId) return;
    pTS_previewContents.send('pts-animgraph:observe-runtime', {
        observerId: observation.observerId,
        uuid: unsubscribe ? '' : observation.uuid,
        instanceId: observation.instanceId,
        subscriptionId: observation.subscriptionId,
        sessionId: pTS_previewSessionId,
    });
}

function pTS_receiveAnimGraphSync(event: pTS_IPreviewSessionEvent, data: unknown) {
    if (!pTS_previewSessionId || event.sender !== pTS_previewContents || !pTS_isPreviewContents(event.sender)
        || !data || typeof data !== 'object') return;
    const payload = data as pTS_IAnimGraphState & { sessionId: string; observerId: string };
    if (payload.sessionId !== pTS_previewSessionId || typeof payload.found !== 'boolean'
        || !Array.isArray(payload.instances) || (payload.instanceId !== null && typeof payload.instanceId !== 'string')) return;
    const observation = pTS_previewObservations.get(payload.observerId);
    if (!observation || observation.uuid !== payload.uuid || observation.subscriptionId !== payload.subscriptionId
        || (observation.instanceId !== null && observation.instanceId !== payload.instanceId)) return;
    const ids = new Set<string>();
    for (const instance of payload.instances) {
        if (!instance || typeof instance.id !== 'string' || !instance.id || ids.has(instance.id)
            || typeof instance.nodeUuid !== 'string' || typeof instance.path !== 'string'
            || typeof instance.controllerClass !== 'string') return;
        ids.add(instance.id);
    }
    if (payload.found && (!payload.instanceId || !ids.has(payload.instanceId))) return;
    observation.instanceId = payload.instanceId;
    const nextState: pTS_IAnimGraphState = {
        isPreview: true,
        found: payload.found,
        uuid: payload.uuid,
        subscriptionId: payload.subscriptionId,
        instances: payload.instances,
        instanceId: payload.instanceId,
        dump: observation.state.dump,
        activeNode: payload.found ? payload.activeNode : undefined,
        controllerClass: payload.found ? payload.controllerClass : undefined,
        variables: payload.found ? payload.variables : undefined,
        layers: payload.found ? payload.layers : undefined,
        components: payload.found ? payload.components : undefined,
    };
    const fingerprint = JSON.stringify(nextState);
    if (fingerprint === observation.fingerprint) return;
    observation.state = nextState;
    observation.fingerprint = fingerprint;
    pTS_broadcastObservation(observation);
}

interface pTS_IAnimGraphCommand {
    observerId?: string;
    uuid?: string;
    subscriptionId?: number;
    instanceId?: string;
}

function pTS_getCommandObservation(info: pTS_IAnimGraphCommand | undefined): pTS_IPreviewObservation | null {
    if (!info || !pTS_previewContents || pTS_previewContents.isDestroyed() || !pTS_previewSessionId
        || !info.instanceId || !info.observerId) return null;
    const observation = pTS_previewObservations.get(info.observerId);
    return observation && observation.state.isPreview && observation.state.found
        && observation.uuid === info.uuid && observation.subscriptionId === info.subscriptionId
        && observation.instanceId === info.instanceId ? observation : null;
}

function pTS_sendCommand(channel: string, observation: pTS_IPreviewObservation, values: Record<string, unknown> = {}) {
    pTS_previewContents!.send(channel, {
        ...values,
        sessionId: pTS_previewSessionId,
        observerId: observation.observerId,
        uuid: observation.uuid,
        subscriptionId: observation.subscriptionId,
        instanceId: observation.instanceId,
    });
    return { success: true };
}

function pTS_installPreviewTransport() {
    try {
        const electron = require('electron') as pTS_IPreviewElectron;
        pTS_previewElectron = electron;
        electron.ipcMain.on('pts-animgraph:preview-session', pTS_receivePreviewSession);
        electron.ipcMain.on('pts-animgraph:sync-animgraph', pTS_receiveAnimGraphSync);
        pTS_requestPreviewSession();
    } catch (err) {
        console.error('[pTS-AnimGraph] Failed to install preview transport:', err);
    }
}

function pTS_uninstallPreviewTransport() {
    for (const observation of pTS_previewObservations.values()) pTS_sendObservation(observation, true);
    pTS_previewElectron?.ipcMain.removeListener('pts-animgraph:preview-session', pTS_receivePreviewSession);
    pTS_previewElectron?.ipcMain.removeListener('pts-animgraph:sync-animgraph', pTS_receiveAnimGraphSync);
    pTS_previewContents?.removeListener('destroyed', pTS_endPreviewSession);
    pTS_previewSessionId = null;
    pTS_previewContents = null;
    pTS_previewElectron = null;
    pTS_retiredPreviewSessions.clear();
}

export const methods: Record<string, (...args: unknown[]) => unknown> = {
    openPanel() {
        Editor.Panel.open('pts-animgraph');
    },

    async reload() {
        console.log('[pTS-AnimGraph] Reloading extension cache...');
        for (const observation of pTS_previewObservations.values()) {
            // Keep each host's subscription token stable when refreshing the same selection.
            observation.state = {
                isPreview: !!pTS_previewSessionId, found: false, uuid: observation.uuid,
                instances: [], instanceId: observation.instanceId,
                subscriptionId: observation.subscriptionId, dump: observation.state.dump,
            };
            observation.fingerprint = undefined;
            pTS_broadcastObservation(observation);
            pTS_sendObservation(observation);
        }
        pTS_requestPreviewSession();
    },

    async observeAnimGraph(infoRaw: unknown) {
        const info = infoRaw as { observerId?: string; uuid?: string; instanceId?: string | null } | undefined;
        if (!info || typeof info.observerId !== 'string' || !info.observerId || typeof info.uuid !== 'string' || !info.uuid
            || (info.instanceId != null && typeof info.instanceId !== 'string')) {
            return { isPreview: false, found: false, uuid: '', instances: [], instanceId: null };
        }
        const previous = pTS_previewObservations.get(info.observerId);
        if (previous) pTS_sendObservation(previous, true);
        const subscriptionId = ++pTS_previewSubscriptionId;
        const initialState: pTS_IAnimGraphState = {
            isPreview: !!pTS_previewSessionId, found: false, uuid: info.uuid,
            subscriptionId, instances: [], instanceId: info.instanceId || null, dump: null,
        };
        const observation: pTS_IPreviewObservation = {
            observerId: info.observerId, uuid: info.uuid, subscriptionId,
            instanceId: initialState.instanceId, state: initialState,
        };
        // Reserve before awaiting AssetDB: a later selection/close invalidates this request.
        pTS_previewObservations.set(info.observerId, observation);
        let authoringDump: pTS_IGraphDump | null = null;

        // 1. Direct high-speed, 100% reliable disk parse of the .animgraph file
        try {
            const assetInfo = await Editor.Message.request('asset-db', 'query-asset-info', info.uuid) as { file?: string } | undefined;
            if (assetInfo && assetInfo.file && fs.existsSync(assetInfo.file)) {
                authoringDump = pTS_parseAnimGraphFile(assetInfo.file);
                if (authoringDump) {
                    authoringDump.uuid = info.uuid;
                }
            }
        } catch (e) {}

        // 2. Query scene-script dump to enrich component properties/attributes or fallback if disk query is unavailable
        if (pTS_previewObservations.get(info.observerId) !== observation) return initialState;
        try {
            const sceneDump = await Editor.Message.request('scene', 'execute-scene-script', {
                name: 'pts-core',
                method: 'pTS_get_animgraph_dump',
                args: [info.uuid]
            }) as pTS_IGraphDump | null;
            if (!authoringDump && sceneDump) {
                authoringDump = sceneDump;
            } else if (authoringDump && sceneDump) {
                pTS_enrichDumpWithSceneData(authoringDump, sceneDump);
            }
        } catch (err) {}
        if (pTS_previewObservations.get(info.observerId) !== observation) return initialState;
        observation.state = {
            ...observation.state,
            isPreview: !!pTS_previewSessionId,
            dump: authoringDump,
        };
        observation.fingerprint = JSON.stringify(observation.state);

        if (pTS_previewSessionId) {
            pTS_sendObservation(observation);
        } else {
            pTS_requestPreviewSession();
        }

        return observation.state;
    },

    unobserveAnimGraph(infoRaw: unknown) {
        const info = infoRaw as { observerId?: string; uuid?: string; subscriptionId?: number } | undefined;
        const observation = info && info.observerId ? pTS_previewObservations.get(info.observerId) : undefined;
        if (!observation) return;
        if ((info!.uuid !== undefined && info!.uuid !== observation.uuid)
            || (info!.subscriptionId !== undefined && info!.subscriptionId !== observation.subscriptionId)) return;
        pTS_sendObservation(observation, true);
        pTS_previewObservations.delete(observation.observerId);
    },

    setAnimGraphVariable(infoRaw: unknown) {
        const info = infoRaw as (pTS_IAnimGraphCommand & { name?: string; value?: unknown }) | undefined;
        const observation = pTS_getCommandObservation(info);
        if (!observation || !info || typeof info.name !== 'string') return { success: false, error: 'Stale or unavailable runtime instance.' };
        const variable = observation.state.variables?.find(candidate => candidate.name === info.name);
        const value = info.value;
        if (!variable || (variable.type === 0 && (typeof value !== 'number' || !Number.isFinite(value)))
            || (variable.type === 3 && (typeof value !== 'number' || !Number.isInteger(value)))
            || ((variable.type === 1 || variable.type === 2) && typeof value !== 'boolean')
            || ![0, 1, 2, 3].includes(variable.type)) return { success: false, error: 'Invalid variable value or unsupported type.' };
        return pTS_sendCommand('pts-animgraph:set-variable', observation, { name: info.name, value });
    },

    setAnimGraphLayerWeight(infoRaw: unknown) {
        const info = infoRaw as (pTS_IAnimGraphCommand & { layerIndex?: number; weight?: number }) | undefined;
        const observation = pTS_getCommandObservation(info);
        if (!observation || !info || typeof info.layerIndex !== 'number' || !Number.isInteger(info.layerIndex)
            || !observation.state.layers?.some(layer => layer.index === info.layerIndex)
            || typeof info.weight !== 'number' || !Number.isFinite(info.weight) || info.weight < 0 || info.weight > 1) {
            return { success: false, error: 'Stale instance or invalid layer weight.' };
        }
        return pTS_sendCommand('pts-animgraph:set-layer-weight', observation, { layerIndex: info.layerIndex, weight: info.weight });
    },

    logAnimGraphRuntime(infoRaw: unknown) {
        const observation = pTS_getCommandObservation(infoRaw as pTS_IAnimGraphCommand | undefined);
        return observation ? pTS_sendCommand('pts-animgraph:log-runtime', observation)
            : { success: false, error: 'Stale or unavailable runtime instance.' };
    },

    getComponentScript(infoRaw: unknown) {
        const info = infoRaw as { className?: string } | undefined;
        if (!info || !info.className) return { scriptName: '', content: '' };
        const assetsDir = path.join(Editor.Project.path, 'assets');
        const scriptPath = pTS_findScriptPathForClass(assetsDir, info.className);
        if (!scriptPath) return { scriptName: '', content: '' };
        try {
            const content = fs.readFileSync(scriptPath, 'utf8');
            return { scriptName: path.basename(scriptPath), content };
        } catch (e) {
            return { scriptName: path.basename(scriptPath), content: '' };
        }
    }
};

const pTS_scriptPathCache = new Map<string, string>();

function pTS_findScriptPathForClass(dir: string, className: string): string | null {
    if (pTS_scriptPathCache.has(className)) {
        const cached = pTS_scriptPathCache.get(className);
        if (cached && fs.existsSync(cached)) return cached;
    }
    try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory() && !entry.name.startsWith('.')) {
                const found = pTS_findScriptPathForClass(fullPath, className);
                if (found) return found;
            } else if (entry.name.endsWith('.ts')) {
                const text = fs.readFileSync(fullPath, 'utf8');
                if (text.includes(className)) {
                    pTS_scriptPathCache.set(className, fullPath);
                    return fullPath;
                }
            }
        }
    } catch (e) {}
    return null;
}

export async function load() {
    pTS_checkPtsCoreDependency(false);
    pTS_installPreviewTransport();
    console.log('[pTS-AnimGraph] Extension loaded.');
}

export function unload() {
    pTS_uninstallPreviewTransport();
    // Transport teardown unsubscribes while the preview WebContents is still available.
    pTS_previewObservations.clear();
    console.log('[pTS-AnimGraph] Extension unloaded.');
}
