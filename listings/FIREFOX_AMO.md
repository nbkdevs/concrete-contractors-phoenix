# Firefox Add-ons (AMO) listing: Slab & Bag Calculator

Not submitted. Package: `extensions/dist/slab-bag-calculator-firefox-1.0.0.zip` (MV3). Submit the package first, then edit the listing.
`web-ext lint`: 0 errors, 0 warnings.

| Field | Value |
|---|---|
| Name | Slab & Bag Calculator |
| Add-on ID | `slab-bag-calculator@nbkdevs.github.io` (neutral; no site or brand) |
| Minimum version | Firefox 140.0, Firefox for Android 142.0 (needed for `data_collection_permissions`; 109.0 makes web-ext warn KEY_FIREFOX_UNSUPPORTED_BY_MIN_VERSION) |
| Data collection permissions | `required: ["none"]` |
| Category | Other |
| Tags | concrete, calculator, construction, diy, home improvement |
| Homepage | https://concretecontractorsphoenix.net/ |
| Support site | https://concretecontractorsphoenix.net/ |
| Privacy policy | leave blank (no data collected) |
| Licence | MIT |
| Screenshots | store-graphics/extension/screenshot-1-1280x800.png, -2-, -3- |
| Icon | in the package (128 px) |
| Source code upload | not required (no minification or bundling) |

## Summary (≤ 250 characters)

Concrete volume for slabs, footings, columns and steps in cubic yards, with 80, 60 and 40 lb bag counts and rebar. Works offline.

## Description

Use the Edge description in EDGE_ADDONS.md (identical text).

## Notes to reviewer

Vanilla HTML/CSS/JS popup, no build step. `"permissions": []`, no host permissions, no background or content scripts, no network requests, nothing stored. Test values are listed in EDGE_ADDONS.md under "Notes for certification".
