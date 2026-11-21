// Copies the shared UMD estimator (packages/npm/lib/index.js) into the extension host
// (lib/core.js) and the webview (media/core.js, exposes window.ConcreteEstimator).
// Run: npm run sync-core
'use strict';
const fs = require('fs');
const path = require('path');
const src = path.join(__dirname, '../../npm/lib/index.js');
for (const dest of ['../lib/core.js', '../media/core.js']) fs.copyFileSync(src, path.join(__dirname, dest));
console.log('synced lib/core.js and media/core.js');
