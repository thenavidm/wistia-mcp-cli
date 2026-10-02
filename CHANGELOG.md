# Changelog

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
