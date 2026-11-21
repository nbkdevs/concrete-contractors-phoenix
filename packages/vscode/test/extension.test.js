'use strict';
// Loads extension.js against a minimal stub of the vscode API and drives both commands.
const test = require('node:test');
const assert = require('node:assert');
const Module = require('module');

function makeStub() {
  const commands = {};
  const edits = [];
  const inputs = [];
  const picks = [];
  const editor = { selections: [{}], edit: async (fn) => { fn({ replace: (_s, text) => edits.push(text) }); return true; } };
  const panels = [];
  const vscode = {
    Uri: { joinPath: (...p) => ({ path: p.map((x) => x.path || x).join('/') }) },
    ViewColumn: { Active: -1 },
    commands: { registerCommand: (id, fn) => { commands[id] = fn; return { dispose() {} }; } },
    workspace: { getConfiguration: () => ({ get: (_k, d) => d }), openTextDocument: async () => ({}) },
    env: { clipboard: { writeText: async () => {} } },
    window: {
      activeTextEditor: editor,
      visibleTextEditors: [],
      showInputBox: async (o) => { if (o.validateInput) assert.strictEqual(o.validateInput(inputs[0]), null); return inputs.shift(); },
      showQuickPick: async (items) => picks.shift()(items),
      showTextDocument: async () => editor,
      showErrorMessage: (m) => { throw new Error(m); },
      showInformationMessage: () => {},
      createWebviewPanel: () => {
        let handler;
        const p = { webview: { cspSource: 'vscode-webview:', asWebviewUri: (u) => 'webview:' + u.path, onDidReceiveMessage: (h) => { handler = h; }, html: '' },
          onDidDispose: () => {}, reveal() {}, send: (m) => handler(m) };
        panels.push(p); return p;
      },
    },
  };
  return { vscode, commands, edits, inputs, picks, panels };
}

test('commands register and insert Markdown', async () => {
  const stub = makeStub();
  const orig = Module._load;
  Module._load = function (req, ...rest) { return req === 'vscode' ? stub.vscode : orig.call(this, req, ...rest); };
  try {
    delete require.cache[require.resolve('../extension')];
    const ext = require('../extension');
    const ctx = { subscriptions: [], extensionUri: { path: '/ext' } };
    ext.activate(ctx);
    const ids = Object.keys(stub.commands).sort();
    const pkg = require('../package.json');
    assert.deepStrictEqual(ids, pkg.contributes.commands.map((c) => c.command).sort());

    stub.picks.push((items) => items.find((i) => i.shape === 'slab'));
    stub.inputs.push('20', '20', '4');
    await stub.commands['concreteContractorsEstimator.insertEstimate']();
    assert.match(stub.edits.pop(), /\| 80 lb bags \| 245 \|/);

    stub.picks.push((items) => items.find((i) => i.shape === 'column'));
    stub.inputs.push('12', '4', '6');
    await stub.commands['concreteContractorsEstimator.insertEstimate']();
    assert.match(stub.edits.pop(), /round column/);

    stub.commands['concreteContractorsEstimator.openEstimator']();
    const p = stub.panels[0];
    assert.match(p.webview.html, /Concrete Contractors Estimator/);
    await p.send({ type: 'insert', inputs: { shape: 'footing', length: 60, width: 12, depth: 12, waste: 0 } });
    assert.match(stub.edits.pop(), /60 cu ft/);
  } finally {
    Module._load = orig;
  }
});
