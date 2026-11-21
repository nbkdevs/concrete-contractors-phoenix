'use strict';
/** Builds the estimator webview HTML. Free of the VS Code API so it can be rendered for screenshots. */
function html({ cspSource, nonce, coreUri, reportUri, scriptUri, styleUri, settings }) {
  const s = JSON.stringify(settings || {}).replace(/</g, '\\u003c');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${cspSource}; script-src 'nonce-${nonce}';">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="${styleUri}">
<title>Concrete Contractors Estimator</title>
</head>
<body>
<header>
  <h1>Concrete Contractors Estimator</h1>
  <p>Cubic yards, ready-mix order, 80/60/40 lb bags, rebar or mesh and a rough installed cost for one pour. Runs locally.</p>
</header>
<main>
  <section class="card" aria-label="Inputs">
    <div class="tabs" role="tablist" id="tabs"></div>
    <div class="grid" id="fields"></div>
    <div class="grid">
      <label>Waste %<input id="waste" inputmode="decimal"></label>
      <label class="slab-only">Rebar spacing (in)<input id="spacing" inputmode="decimal"></label>
      <label class="slab-only">Finish<select id="finish"></select></label>
    </div>
    <label class="slab-only check"><input type="checkbox" id="removeOld"> Remove old concrete first</label>
    <p class="err" id="err" role="alert"></p>
  </section>
  <section class="card" aria-label="Estimate">
    <div class="total"><span>Order</span><strong id="headline">-</strong></div>
    <p class="sub" id="subline"></p>
    <table><tbody id="rows"></tbody></table>
    <div class="actions">
      <button id="insert">Insert as Markdown table</button>
      <button id="copy" class="secondary">Copy Markdown</button>
    </div>
  </section>
</main>
<script nonce="${nonce}">window.__ESTIMATOR_SETTINGS__ = ${s};</script>
<script nonce="${nonce}" src="${coreUri}"></script>
<script nonce="${nonce}" src="${reportUri}"></script>
<script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
}

module.exports = { html };
