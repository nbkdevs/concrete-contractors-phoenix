'use strict';
const vscode = require('vscode');
const crypto = require('crypto');
const report = require('./lib/report');
const panelHtml = require('./lib/panel');

const SECTION = 'concreteContractorsEstimator';
const NAME = 'Concrete Contractors Estimator';

function settings() {
  const c = vscode.workspace.getConfiguration(SECTION);
  return { wastePercent: c.get('wastePercent', 10), rebarSpacing: c.get('rebarSpacing', 18), finish: c.get('finish', 'broom') };
}

async function insertMarkdown(md) {
  let editor = vscode.window.activeTextEditor;
  if (!editor) {
    const doc = await vscode.workspace.openTextDocument({ language: 'markdown', content: '' });
    editor = await vscode.window.showTextDocument(doc);
  }
  await editor.edit((e) => { for (const sel of editor.selections) e.replace(sel, md); });
}

const positive = (t) => { const v = parseFloat(String(t).replace(/[,\s]/g, '')); return Number.isFinite(v) && v > 0 ? null : 'Enter a number greater than zero'; };

async function runInsert() {
  const pick = await vscode.window.showQuickPick(
    Object.entries(report.SHAPES).map(([shape, s]) => ({ label: s.label, description: s.fields.map((f) => f[1]).join(', '), shape })),
    { title: 'Insert concrete estimate', placeHolder: 'What are you pouring?' }
  );
  if (!pick) return;
  const s = settings();
  const input = { shape: pick.shape, waste: s.wastePercent / 100 };
  for (const [key, label, def] of report.SHAPES[pick.shape].fields) {
    const v = await vscode.window.showInputBox({ title: `${NAME}: ${pick.label}`, prompt: label, value: String(def), validateInput: positive });
    if (v === undefined) return;
    input[key] = parseFloat(v.replace(/[,\s]/g, ''));
  }
  if (pick.shape === 'slab') { input.spacing = s.rebarSpacing; input.finish = s.finish; }
  try {
    await insertMarkdown(report.toMarkdown(report.build(input)));
  } catch (err) {
    vscode.window.showErrorMessage(`${NAME}: ${err.message}`);
  }
}

let current;
function openEstimator(context) {
  if (current) { current.reveal(); return; }
  const media = vscode.Uri.joinPath(context.extensionUri, 'media');
  const lib = vscode.Uri.joinPath(context.extensionUri, 'lib');
  const panel = vscode.window.createWebviewPanel('concreteContractorsEstimator', NAME, vscode.ViewColumn.Active, {
    enableScripts: true,
    localResourceRoots: [media, lib],
  });
  current = panel;
  panel.iconPath = vscode.Uri.joinPath(context.extensionUri, 'icon.png');
  const w = panel.webview;
  w.html = panelHtml.html({
    cspSource: w.cspSource,
    nonce: crypto.randomBytes(16).toString('hex'),
    coreUri: w.asWebviewUri(vscode.Uri.joinPath(media, 'core.js')),
    reportUri: w.asWebviewUri(vscode.Uri.joinPath(lib, 'report.js')),
    scriptUri: w.asWebviewUri(vscode.Uri.joinPath(media, 'panel.js')),
    styleUri: w.asWebviewUri(vscode.Uri.joinPath(media, 'panel.css')),
    settings: settings(),
  });
  w.onDidReceiveMessage(async (msg) => {
    if (!msg || !msg.inputs) return;
    try {
      const md = report.toMarkdown(report.build(msg.inputs));
      if (msg.type === 'copy') {
        await vscode.env.clipboard.writeText(md);
        vscode.window.showInformationMessage('Concrete estimate copied as Markdown.');
      } else if (msg.type === 'insert') {
        const target = vscode.window.visibleTextEditors[0];
        if (target) await vscode.window.showTextDocument(target.document, target.viewColumn);
        await insertMarkdown(md);
      }
    } catch (err) {
      vscode.window.showErrorMessage(`${NAME}: ${err.message}`);
    }
  }, undefined, context.subscriptions);
  panel.onDidDispose(() => { current = undefined; }, undefined, context.subscriptions);
}

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('concreteContractorsEstimator.openEstimator', () => openEstimator(context)),
    vscode.commands.registerCommand('concreteContractorsEstimator.insertEstimate', runInsert)
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
