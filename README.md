# kannabi-plugin-depot

depot compatibility for [Kannabi](https://github.com/iomz/kannabi), as a plugin.

depot is the inventory system z-sense's Kannabi deployment replaces, and this plugin is z-sense's.
This plugin keeps what depot put into the world working while that deployment moves over, and is deleted once nothing needs it.
It is a compatibility appliance, not a design to build on: isolation and removability matter more here than generality.

## What it contributes

- Addresses: depot's legacy links, `/01<GTIN>21<serial>`, resolved to the Asset holding that SGTIN.

## How it relates to the GS1 plugin

depot's asset numbers are ordinary SGTINs.
They are held by the [GS1 plugin](https://github.com/iomz/kannabi-plugin-gs1) like any other, so this plugin requires it, holds no identifier of its own, and judges no GS1 syntax.
It is a consumer of the GS1 plugin and never a rival scheme.

## Legacy links

depot printed each Asset's QR code, and mailed each grant, as its configured domain URL followed by the Asset's SGTIN with the element string's parentheses removed:

```text
(01)00614141123452(21)login.8  ->  https://<depot domain>/010061414112345221login.8
```

A grant mail put a slash of its own after the domain, so those links carry two.
Once the deployment points depot's domain at Kannabi, both forms reach the Asset holding that SGTIN.
Which hosts reach Kannabi is the deployment's choice; the plugin reads the path alone and knows no domain.

- The parse is exact and repairs nothing: a GTIN is fourteen digits, and the serial is everything after the `21` that follows it, decoded once.
- The value is accepted through the installed `sgtin` scheme, exactly as recording it would be.
- A link renders the Asset page in place and is never redirected, like every address a plugin claims.
- Resolving a link grants nothing. A private Asset, an SGTIN nobody holds, and a value GS1 refuses all answer the same 404, so a label tells an outsider nothing.
- No Asset surfaces a legacy link: depot's links are kept working, not handed out again.

The web route is React Router's splat, because a router segment cannot be narrowed by pattern and a doubled slash never matches a named segment.
Every route core or another plugin declares outranks it, and anything that is not a legacy link answers the same 404 an unknown path did before.

Malformed legacy values, such as a GRAI written with a trailing AI 21, are not claimed and are left for later.

## Requirements

- Kannabi plugin contract 1.
- The GS1 plugin, listed before this one.

## Installing it

List it after the GS1 plugin in `kannabi.plugins.json`:

```json
{
  "plugins": [
    { "id": "gs1", "repository": "https://github.com/iomz/kannabi-plugin-gs1.git", "ref": "v0.1.3" },
    { "id": "depot", "repository": "https://github.com/z-sense/kannabi-plugin-depot.git", "ref": "v0.1.0" }
  ]
}
```

```bash
pnpm plugins:sync
```

## Tests

The tests are under `tests/` and run from the Kannabi checkout, with `pnpm test` and `pnpm test:integration`.
They run under `test-composition.mjs`, which composes the GS1 plugin and this one and nothing else.
CI checks this repository inside a Kannabi checkout against Kannabi's `main` on every change here and once a day.
