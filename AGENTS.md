# depot plugin rules

These are the rules of the depot plugin (`plugins/depot/`).
They add to the project rules in Kannabi's root `AGENTS.md` and to the GS1 plugin's, and never relax one.

- This plugin exists to retire depot and is deleted once nothing needs it. Prefer isolation and removability over generality; a need only depot has stays here and never shapes Kannabi core or the GS1 plugin.
- depot's asset numbers are ordinary SGTINs held by the GS1 plugin. This plugin is a consumer of the GS1 plugin, never a rival scheme: it holds no identifier, accepts values only through the installed schemes, and judges no GS1 syntax itself.
- Data that is depot's alone — notes, categories, locations, statuses, memos and the legacy ledger — lives here, under `Depot…` labels and keyed by `Asset.id`, when it arrives. Assets, photos, Groups and identifiers stay in core and the GS1 plugin.
- A legacy link is read exactly as depot printed it and is never repaired. A value the installed schemes refuse names nothing.
- Resolving a legacy link grants no access, and every refusal is indistinguishable from an address that names nothing.
- No Asset surfaces a legacy link.
- Keep the framing neutral: this is depot compatibility, not a judgement of depot.
- Serials may contain personal logins. Examples in code, tests and documents use fictional values.
