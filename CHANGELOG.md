# Changelog

## 3.0.0, 2026-10-05

Built on [Slipway](https://github.com/thenavidm/slipway) 0.1.20. The 169 tools keep their names and arguments, and every difference below was measured against 2.0.1, the last version on npm, before release.

- **A person approves each confirmed operation over MCP.** All 83 still need confirmation. Claude Code (2.1.246 and later) shows its own prompt, and a client that can show forms asks with an approval form whose one box starts unticked. Approvals are signed, bound to the exact call and work once. Where a client can do neither, the model's `confirm: true` still counts, and `WISTIA_CONFIRM=model` makes it enough everywhere. The refusal and the approval form both say what 2.0 said, that the call may affect account content, media, messages, workflows or billing, and the audit log records who approved each one.
- **`WISTIA_ALLOW_DESTRUCTIVE=0` still refuses all 83**, confirmed or not, and `WISTIA_READ_ONLY=1` still leaves only the 86 reads.
- **Wistia's status picks the exit code.** A request Wistia rejects (400 or 422) exits 2 instead of 5, and a removed resource (410) 3 instead of 5. 401 and 403 still exit 4, 404 3, 429 7, a server error 5, and an unknown profile or nothing configured 10. 1 now means an unexpected error.
- **`which <words>` finds a command**, and `agent-context` describes every command, flag and setting as JSON. In Codex 0.159.3, finding the command that imports media from a URL and its flags took a median of 83,866 input tokens over the CLI instead of 86,367 (five runs each): every 2.0.1 run read the general help, the 11,488-character command list and the command's help, and two read the schema as well. 3.0.0's asked `which import media from URL`, whose answer carries the command's help, and four then read the schema; the fifth asked a shorter question, got the list alone, and read the help.
- **`install <client>`** adds the server to Claude Code, Codex, Claude Desktop, Cursor, VS Code or Gemini CLI in each one's own format, and **`wistia-mcp --http`** serves the same tools over Streamable HTTP, on 127.0.0.1:8787 unless told otherwise.
- **A smaller tool list.** Parts that several tools repeated, such as the player plugin settings, are written once and referred to, so the list is 108,293 o200k tokens instead of 126,781. With every tool loaded, Claude Code 2.1.286 spends 147,760 tokens a message on the list instead of 175,141.
- **Less work to start.** Each input and body schema now compiles on its first use rather than at load, and the entry turns on Node's compile cache. The server spends 235 ms of CPU before its first answer where 2.0.1 spent 598, and answers in 147 ms of wall time instead of 328 (median of 21 runs, taking turns on one Mac). npx installs 10 dependencies instead of 94. A test still compiles every schema.
- **`doctor --network` reads the account**, as 2.0's did.
- **Docs.** README section 7 has the measured Claude Code and Codex costs, where 2.0 said they were pending, and the settings table lists every variable, `WISTIA_AUTH_SCHEME` among them.

### Upgrading

Over MCP, expect an approval prompt or form before any confirmed operation; a headless agent that should run them with `confirm: true` alone needs `WISTIA_CONFIRM=model`. A script that read exit 5 as a rejected request should read 2, and as a removed resource 3. An error is now one JSON object with `error`, Slipway's `code` (`usage`, `refused`, `auth`, `not_found`, `rate_limited`, `api`, `not_configured`) and a `hint`, plus Wistia's `status` when it answered; 2.0.1 printed the tool's JSON inside the `error` string. Over MCP, an argument that fails the schema comes back as the MCP SDK's own message, "Input validation error: …", instead of JSON. With `WISTIA_READ_ONLY=1`, a client that calls a hidden tool gets "tool not found" instead of a refusal naming `WISTIA_READ_ONLY`, and that call is not in the audit log; the CLI still names the setting. The audit log's lines gain `confirmed_by`, and each allowed call is followed by a `done` or `failed` line. A script that pipes JSON-RPC into the server must keep stdin open until it reads the answer: the server now stops when its input ends, as the MCP stdio binding asks. `--http` refuses a page from another site unless `WISTIA_HTTP_ALLOWED_ORIGINS` lists it. Some terminal screens grew: the general help by 41 tokens, for `which`, `install`, what each setting is for and the exit codes; the command list by 16; and a missing argument's error by 14, for its code and a hint. `SKILL.md` is 79 tokens longer in Claude Code, because it says how approval works over MCP and how `which` finds a command, and that exit 1 is an unexpected error and 2 also an unknown command or a hidden write.

## 2.0.1, 2026-10-04

- **`npx -y @thenavidm/wistia-mcp-cli` always starts the MCP server.** npx starts whichever binary the npm registry lists first when they share one file, and the registry does not keep the published order, so an MCP client set up with this README's install line could get `wistia-cli` and its command list instead of a server. A third binary named after the package now always starts the server, and npx picks it by name.

Use the native terminal capture at 1040 source pixels with lossless GIF optimization, displayed at 520 pixels, matching the Bluesky/Substack reference. Original assets remain available.

## 2.0.0 - 2026-10-02

- Update to the published stable September API schema: 167 HTTP operations, separate form/file uploads and a local account helper, 169 tools total.
- Add shared CLI/MCP, 86 reads and 83 confirmed mutations, direct-call read-only enforcement and private named accounts.
- Fix legacy URL construction that dropped /modern; retain dated API header, separate fixed uploader and exact current body/query names.
- Add bounded native offset paging, accurate continuation metadata and repeated-page protection.
- Treat caption matching as a nonmutating POST; validate targeted edit versions and paired ordered windows.
- Save generated credentials exclusively to private files instead of returning them to AI context; no mutation or POST retries.
- Add full client/OS, tools/arguments, workflow, comparison, privacy and accordion FAQ documentation, desktop packaging and release gates.
- Preserve AGPL-3.0-or-later and Wistia schema MIT attribution; no private legacy history or credentials are published.

### Migration from the 33 legacy tools

| Legacy tool | Current tool | Migration |
| --- | --- | --- |
| `get_account` | `get_account` | Inspect current schema/identifier fields; mutations require explicit confirmation |
| `list_folders` | `list_folders` | Inspect current schema/identifier fields; mutations require explicit confirmation |
| `create_folder` | `create_folder` | Preserve declared adminEmail and other camelCase body fields |
| `get_folder` | `get_folder` | Inspect current schema/identifier fields; mutations require explicit confirmation |
| `update_folder` | `update_folder` | Inspect current schema/identifier fields; mutations require explicit confirmation |
| `delete_folder` | `delete_folder` | Inspect current schema/identifier fields; mutations require explicit confirmation |
| `list_media` | `list_media` | Current offset/cursor modes and bounded all_pages; arrays are repeated query values |
| `get_media` | `get_media` | Inspect current schema/identifier fields; mutations require explicit confirmation |
| `update_media` | `update_media` | Inspect current schema/identifier fields; mutations require explicit confirmation |
| `delete_media` | `delete_media` | Inspect current schema/identifier fields; mutations require explicit confirmation |
| `copy_media` | `copy_media` | Inspect current schema/identifier fields; mutations require explicit confirmation |
| `get_media_stats` | `get_media_stats` | Inspect current schema/identifier fields; mutations require explicit confirmation |
| `archive_media` | `archive_media` | Inspect current schema/identifier fields; mutations require explicit confirmation |
| `move_media` | `move_media` | Inspect current schema/identifier fields; mutations require explicit confirmation |
| `upload_media` | `upload_media` | Public URL form uses Bearer header; new upload_media_file handles local bytes |
| `list_captions` | `list_captions` | Inspect current schema/identifier fields; mutations require explicit confirmation |
| `create_captions` | `create_captions` | caption_file and language replace srt_content/language_code for creation |
| `get_captions` | `get_captions` | Inspect current schema/identifier fields; mutations require explicit confirmation |
| `delete_captions` | `delete_captions` | Inspect current schema/identifier fields; mutations require explicit confirmation |
| `list_tags` | `list_tags` | Inspect current schema/identifier fields; mutations require explicit confirmation |
| `bulk_tag` | `bulk_tag` | hashed_ids/tag_names replace media_hashed_ids/tags |
| `list_channels` | `list_channels` | Inspect current schema/identifier fields; mutations require explicit confirmation |
| `create_channel` | `create_channel` | Inspect current schema/identifier fields; mutations require explicit confirmation |
| `get_channel` | `get_channel` | Inspect current schema/identifier fields; mutations require explicit confirmation |
| `delete_channel` | `delete_channel` | Inspect current schema/identifier fields; mutations require explicit confirmation |
| `search` | `search` | Inspect current schema/identifier fields; mutations require explicit confirmation |
| `list_webinars` | `list_webinars` | Inspect current schema/identifier fields; mutations require explicit confirmation |
| `create_webinar` | `create_webinar` | Inspect current schema/identifier fields; mutations require explicit confirmation |
| `create_webinar_registration` | `create_webinar_registration` | Current email, first_name and last_name body fields |
| `get_account_stats` | `get_account_stats` | Inspect current schema/identifier fields; mutations require explicit confirmation |
| `get_media_engagement` | `get_media_engagement` | Inspect current schema/identifier fields; mutations require explicit confirmation |
| `get_media_stats_by_date` | `get_media_stats_by_date` | Inspect current schema/identifier fields; mutations require explicit confirmation |
| `get_job_status` | `get_job_status` | Singular background_job_status route and background_job_status_id |

| Component | Version / baseline | Meaning |
| --- | --- | --- |
| Package / desktop manifest | 2.0.0 | Shared MCP/CLI, complete reference and guarded workflows |
| Modern Data API header | 2026-09 | Explicit dated release; support lifetime remains provider-controlled |
| Pinned official schema | 2026.09.0 | Official CLI v2026.9.0 source, 167 HTTP operations |
| MCP TypeScript SDK | 1.32.0 | Actual installed shared protocol baseline |
| Node | 22+ | CLI/manual MCP and compatible desktop runtime |
| TypeScript / Vitest | 7.0.2 / 5.0.3 | Development build and meaningful behavior checks |
| MCPB | 2.1.2 | Development packaging only |
| Legacy source | 1.0.0, 33 MCP tools | Prior manually assembled MCP-only implementation |

The public root preserves AGPL-3.0-or-later and the official schema's MIT notice. It does not push private legacy history. Current default schema excludes 25 edge-only HTTP additions, including Remix and custom metadata, until their stable eligibility is reviewed. The hosted official MCP separately documents Remix; this release does not claim matching that hosted surface.

Routes preserve /modern, with a dated version header and separate uploader. Caption creation, bulk tagging and webinar registration use current fields. Folder body camelCase and uploader project_id are retained where declared. Stats projects routes remain valid. Every old tool name maps to a current command in [CHANGELOG.md](CHANGELOG.md); argument changes still require migration review. No token benchmark or live account outcome is invented.

Original/sanitized SHA-256 and pinned commit are in src/tools/api-source.json. Regeneration strips examples without relying on them for validation. Typecheck/build, 30 fixtures and actual full/read-only discovery are distinct from provider account outcomes, desktop GUI installation and measured Codex task usage.

## 1.0.0 - legacy source

33 manually declared MCP-only tools. This is a source-history record, not an assertion of a prior public npm release.
