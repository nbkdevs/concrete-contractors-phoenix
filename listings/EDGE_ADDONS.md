# Microsoft Edge Add-ons listing: Slab & Bag Calculator

Not submitted. Package: `extensions/dist/slab-bag-calculator-edge-1.0.0.zip` (MV3, `"permissions": []`).
The extension's code, popup, name and description contain no link to or mention of any website, brand or place.

| Field | Value |
|---|---|
| Name | Slab & Bag Calculator |
| Version | 1.0.0 |
| Category | Productivity |
| Website / homepage URL | https://concretecontractorsphoenix.net/ |
| Support URL | https://concretecontractorsphoenix.net/ |
| Privacy policy URL | https://concretecontractorsphoenix.net/privacy-policy/ |
| Logo 300x300 | store-graphics/extension/edge-logo-300x300.png |
| Small promo tile 440x280 | store-graphics/extension/promo-440x280.png |
| Screenshots 1280x800 | store-graphics/extension/screenshot-1-1280x800.png, -2-, -3- |
| Search terms | concrete calculator, cubic yards, concrete bags, rebar, slab calculator, footing, sonotube |
| Data collection | none |

## Short description / summary

Concrete volume for slabs, footings, columns and steps in cubic yards, with 80, 60 and 40 lb bag counts and rebar. Works offline.

## Description

Slab & Bag Calculator answers the two questions every concrete job starts with: how much concrete, and how many bags?

Pick a shape and type the measurements:
- Slab (driveways, patios, sheds, garage floors): length, width and thickness, plus rebar spacing
- Footing: total length, width and depth
- Column or sonotube: diameter, height and how many
- Steps: number of steps, rise, run and width

You get, instantly:
- Cubic yards and cubic feet including your waste allowance
- The ready-mix order quantity rounded up to the next quarter yard
- How many 80 lb, 60 lb and 40 lb bags of premixed concrete that is
- Whether bags or a ready-mix delivery make more sense
- For slabs: rebar in linear feet and 20 ft sticks, or the number of 5 x 10 ft mesh sheets

Private by design: no permissions, no account, no tracking, no network requests. Everything is calculated inside the popup and nothing is stored.

## Single purpose

Calculate the concrete volume, bag count and reinforcement for a slab, footing, column or set of steps from measurements the user types into the popup.

## Permission justification

The extension requests no permissions and no host access. It has no background script, content script or remote code.

## Notes for certification

- No login, no setup. Click the toolbar icon to open the popup.
- Test: with the default Slab values (20 x 10 ft, 4 in, 10 % waste) the result is 2.72 yd³, order 2.75 yd³, 123 x 80 lb bags, rebar 280 ft (16 x 20 ft sticks) or 5 mesh sheets.
- Click Column: 12 in diameter, 4 ft, 4 columns gives 0.51 yd³ and 24 x 80 lb bags with the suggestion to use bags.
- Enter 0 in any field to see the validation message.
- The package is plain HTML, CSS and JavaScript with no build step, minification or remote code; `manifest.json` lists `"permissions": []`.
