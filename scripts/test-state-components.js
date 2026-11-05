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

const graph = {
    __type__: 'cc.animation.AnimationGraph',
    _layers: [],
    _variables: {}
};
record(graph);

const sm = {
    __type__: 'cc.animation.StateMachine',
    _states: [],
    _transitions: []
};
const smRef = record(sm);

const rootState = {
    __type__: 'cc.animation.Motion',
    name: 'Attack',
    __editorExtras__: { id: 'attack-state-id', centerX: 0, centerY: 0 },
    _components: [
        record({
            __type__: 'Character_Graph_Transition',
            _objFlags: 0,
            _id: 'char-trans-id',
            fast: record({ __uuid__: 'd9893b4d-4708-4b26-96ec-cc6fb987f665', __expectedType__: 'FastSpineAsset' }),
            intLoopCountToTrigger: 6,
            triggerOnComplete: 'attack',
            durationOverride: 0,
            replayThrottle: 0.1,
            maxExtendDuration: 1,
            onStateMachineEnters: [],
            onStateMachineExits: [],
            tracers: ['ready', 'enter'],
            _activeController: null,
            _isStateActive: true,
            _stateEnterTime: 12.5,
            _lastReplayTime: 0.1,
            _cachedDuration: 1.5,
        })
    ]
};
const rootStateRef = record(rootState);
sm._states.push(rootStateRef);

graph._layers.push(record({
    __type__: 'cc.animation.Layer',
    name: 'Base Layer',
    weight: 1,
    _stateMachine: smRef
}));

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pts-animgraph-comp-test-'));
try {
    const filePath = path.join(tempDir, 'test.animgraph');
    fs.writeFileSync(filePath, JSON.stringify(objects));

    const dump = pTS_parseAnimGraphFile(filePath);
    assert.ok(dump, 'pTS_parseAnimGraphFile must succeed');

    const state = dump.layers[0].stateMachines[0].states[0];
    assert.equal(state.name, 'Attack');
    assert.equal(state.components.length, 1);

    const comp = state.components[0];
    assert.equal(comp.className, 'Character_Graph_Transition');

    const expected = [
        'fast', 'intLoopCountToTrigger', 'triggerOnComplete', 'durationOverride',
        'replayThrottle', 'maxExtendDuration', 'onStateMachineEnters', 'onStateMachineExits',
        'tracers', '_activeController', '_isStateActive', '_stateEnterTime',
        '_lastReplayTime', '_cachedDuration'
    ];
    for (const key of expected) {
        assert.ok(key in comp.props, `Property "${key}" must be present in parsed component props`);
    }

    // Engine internals must not be present
    assert.equal(comp.props._objFlags, undefined);
    assert.equal(comp.props._id, undefined);
    assert.equal(comp.props.__type__, undefined);

    // Values verification
    assert.equal(comp.props.intLoopCountToTrigger, 6);
    assert.equal(comp.props.triggerOnComplete, 'attack');
    assert.equal(comp.props._isStateActive, true);
    assert.equal(comp.props._stateEnterTime, 12.5);
    assert.deepEqual(comp.props.tracers, ['ready', 'enter']);

    console.log('✅ State component property preservation test passed.');
} finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
}
