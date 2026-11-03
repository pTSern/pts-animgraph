const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pTS_parseAnimGraphFile } = require('../dist/main.js');

const objects = [];
function record(value) {
    const ref = { __id__: objects.length };
    objects.push(value);
    return ref;
}
function state(machine, type, name, nested = null) {
    const value = {
        __type__: type, name,
        // Names, authored IDs, and coordinates deliberately repeat across scopes.
        __editorExtras__: { id: 'copied-editor-id', centerX: 100, centerY: 50 },
        _components: [],
    };
    if (nested) value._stateMachine = nested.ref;
    const ref = record(value);
    machine.value._states.push(ref);
    return ref;
}
function machine(special = true) {
    const value = { __type__: 'cc.animation.StateMachine', _states: [], _transitions: [] };
    const result = { value, ref: record(value) };
    if (special) {
        value._entryState = state(result, 'cc.animation.State', 'Entry');
        value._exitState = state(result, 'cc.animation.State', 'Exit');
        value._anyState = state(result, 'cc.animation.State', 'Any');
    }
    return result;
}
function transition(machine, from, to, properties = {}) {
    const ref = record({ __type__: 'cc.animation.AnimationTransition', from, to, duration: 0.2, conditions: [], ...properties });
    machine.value._transitions.push(ref);
    return ref;
}

const graph = { __type__: 'cc.animation.AnimationGraph', _layers: [], _variables: {} };
record(graph);
const root = machine();
const left = machine();
const right = machine();
const empty = machine(false);
const leftState = state(root, 'cc.animation.SubStateMachine', 'Left', left);
const rightState = state(root, 'cc.animation.SubStateMachine', 'Right', right);
state(root, 'cc.animation.Motion', 'Entry'); // Must not be classified as a special state by name.
const leftIdle = state(left, 'cc.animation.Motion', 'Idle');
const rightIdle = state(right, 'cc.animation.Motion', 'Idle');
state(left, 'cc.animation.SubStateMachine', 'Empty', empty);
const binding = record({ __type__: 'cc.animation.TCVariableBinding', type: 3, variableName: 'state' });
const binary = record({ __type__: 'cc.animation.BinaryCondition', operator: 0, lhs: 0, lhsBinding: binding, rhs: 7 });
transition(root, root.value._entryState, leftState, { conditions: [binary] });
transition(root, rightState, root.value._exitState);
transition(left, left.value._entryState, leftIdle);
transition(left, leftIdle, left.value._exitState);
transition(left, leftIdle, leftIdle);
transition(right, right.value._entryState, rightIdle);
transition(right, rightIdle, right.value._exitState);
const trigger = record({ __type__: 'cc.animation.TriggerCondition', trigger: 'hit' });
transition(root, root.value._entryState, leftState, { conditions: [trigger] });
graph._layers.push(record({ __type__: 'cc.animation.Layer', name: 'main', weight: 1, _stateMachine: root.ref }));

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'pTS-graph-hierarchy-'));
try {
    const file = path.join(directory, 'nested.animgraph');
    fs.writeFileSync(file, JSON.stringify(objects));
    const dump = pTS_parseAnimGraphFile(file);
    assert.ok(dump, 'valid authored graph must produce a dump');
    const layer = dump.layers[0];
    assert.ok(Array.isArray(layer.stateMachines), 'nested machines must remain separate graph scopes');
    const top = layer.stateMachines.find(item => item.id === layer.stateMachineId);
    const leftNode = top.states.find(item => item.name === 'Left');
    const rightNode = top.states.find(item => item.name === 'Right');
    const leftGraph = layer.stateMachines.find(item => item.id === leftNode.stateMachineId);
    const rightGraph = layer.stateMachines.find(item => item.id === rightNode.stateMachineId);
    const emptyNode = leftGraph.states.find(item => item.name === 'Empty');
    const emptyGraph = layer.stateMachines.find(item => item.id === emptyNode.stateMachineId);
    assert.equal(leftGraph.path, 'main/Left');
    assert.equal(rightGraph.path, 'main/Right');
    assert.equal(emptyGraph.path, 'main/Left/Empty');
    assert.deepEqual(emptyGraph.states, [], 'empty nested machines must remain navigable');
    assert.deepEqual(emptyGraph.transitions, []);
    assert.equal(top.states.filter(item => item.type === 'Entry').length, 1, 'special state identity is not its display name');
    assert.equal(top.states.find(item => item.type === 'Motion' && item.name === 'Entry').stateMachineId, null);
    assert.equal(top.transitions[0].to, leftNode.id, 'root transition must target its own submachine node');
    assert.equal(top.transitions[1].from, rightNode.id);
    assert.notEqual(top.transitions[0].id, top.transitions[2].id, 'parallel arrows must remain independently selectable');
    const condition = top.transitions[0].conditions[0];
    assert.equal(condition.type, 'cc.animation.BinaryCondition');
    assert.equal(condition.properties.operator, 0);
    assert.equal(condition.properties.rhs, 7, 'comparison operand must survive the inspector dump');
    assert.equal(condition.properties.lhsBinding.variableName, 'state', 'condition bindings must resolve serialized references');
    assert.equal(top.transitions[2].conditions[0].properties.trigger, 'hit');
    assert.deepEqual(top.transitions[1].conditions, [], 'unconditional edges must not inherit another arrow conditions');
    const ids = new Set();
    for (const scope of layer.stateMachines) {
        const local = new Set(scope.states.map(item => item.id));
        for (const item of scope.states) {
            assert.ok(!ids.has(item.id), 'copied authoring IDs must not alias distinct runtime graph nodes');
            ids.add(item.id);
            assert.equal(item.centerX, 100, 'coordinates belong to the original local scope');
            assert.equal(item.centerY, 50);
        }
        for (const edge of scope.transitions) {
            assert.ok(local.has(edge.from) && local.has(edge.to), 'an edge must not escape its state-machine scope');
        }
    }
    const leftMotion = leftGraph.states.find(item => item.name === 'Idle');
    const rightMotion = rightGraph.states.find(item => item.name === 'Idle');
    assert.notEqual(leftMotion.id, rightMotion.id, 'same-name states in sibling scopes must stay distinct');
    assert.equal(leftGraph.transitions[0].to, leftMotion.id);
    assert.equal(rightGraph.transitions[0].to, rightMotion.id);
    assert.ok(leftGraph.transitions.some(edge => edge.from === leftMotion.id && edge.to === leftMotion.id), 'self-transitions must survive the dump');
    const second = pTS_parseAnimGraphFile(file);
    assert.deepEqual(second.layers, dump.layers, 'same asset must retain deterministic identities between observations');
    console.log('pTS nested graph hierarchy and endpoint isolation checks passed.');
} finally {
    fs.rmSync(directory, { recursive: true, force: true });
}
