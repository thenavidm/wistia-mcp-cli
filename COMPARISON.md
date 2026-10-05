# Wistia comparisons

| Offering | Surface | Capabilities and tradeoff |
| --- | --- | --- |
| [Official Wistia MCP](https://docs.wistia.com/docs/mcp-server-guide) | Hosted https://api.wistia.com/mcp/api, OAuth/Bearer | Broad account actions, owners/managers, selectable toolsets including Remix; client approval controls apply |
| [Official Wistia CLI](https://github.com/wistia/wistia-cli/releases/tag/v2026.9.0) | Native wistia binary / @wistia/wistia-cli | September Data API, JSON/YAML/table/TOON, jq, body schemas, agent mode, dry-run preview and OS keychain setup |
| This package | Local MCP + shared task CLI + desktop archive | Same stable schema baseline, mandatory mutation confirmation, direct-call read-only enforcement, bounded pages, named private accounts and private generated-credential output |
| Legacy Navid wrapper | MCP-only source | 33 manually declared tools; superseded by the current shared implementation, without republishing its private history |

Checked October 2, 2026. The official CLI v2026.9.0 Darwin arm64 archive was checksum-verified, and version/help plus network-free dry-run media list/delete were inspected. The tested version command is wistia version. Its global help advertises dry-run and machine formats; the reviewed media delete help does not expose a mandatory confirm flag. That observation concerns the CLI, not hosted MCP client approval. Its media list help offers native page/per_page/cursor flags; our bounded all_pages/max_items/continuation workflow is a distinct local feature. We do not claim that all official resource groups lack workflow helpers.

The official MCP's selective toolsets can reduce discovery scope. Official CLI jq/TOON and schemas are already useful agent features; they are not innovations claimed for our package. The official keychain and dry-run features are advantages where those workflows matter. This package requires local credential setup, Node and maintenance. Neither tool counts nor the no-network preview establish task reliability, coverage superiority or token savings. No authenticated official MCP discovery or destructive live competitor test was performed.

A targeted current GitHub/source search found the provider CLI and our legacy wrapper; no independently validated Wistia-specific community implementation is claimed. Compare the source, actual surface and required task before selecting a package. Official products are useful comparison choices, while this page features the owned implementation we build.

MCP and CLI use the same schemas, validation and HTTP handlers: [Slipway](https://github.com/thenavidm/slipway) builds the MCP server, over stdio or `--http`, and the CLI from each tool's one definition; there is no second API implementation.

README section 7 has this package's measured Claude Code and Codex costs against 2.0.1. No other offering was measured, so no comparison with one is claimed.
