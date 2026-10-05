# Security

Report privately through [GitHub private reporting](https://github.com/thenavidm/wistia-mcp-cli/security/advisories/new). Never attach real tokens, private media, participants, captions or signed links.

Authorized data requests go directly to https://api.wistia.com/modern; uploads go to https://upload.wistia.com/. Redirects and arbitrary credential-bearing origins are refused. This package has no Navid-hosted relay, analytics or telemetry. Tokens come from private settings/files and stay in memory. Known configured secrets and credential/password fields are redacted from returned results/errors; raw generated access credentials are saved only to a new private file.

Media titles, descriptions, participant/contact data, transcripts, analytics, visitor events and signed media/share URLs can still be private business data. Secret redaction does not anonymize them. Your AI client and Wistia apply their own retention/sharing policies. --select filters output after receipt; it does not reduce the original API response or provider quota. Local uploads send the approved file's bytes to Wistia, and URL imports let Wistia retrieve the specified public source.

Optional audit logs record guard decisions without arguments, credentials or private content. Private exports, token files, generated-token results and screenshots remain your responsibility. Keep secrets outside public source, npm and desktop archives. Use [SECURITY.md](SECURITY.md) for private vulnerability reports.

All 83 writes require `confirm:true` in MCP or `--confirm` in CLI for the action the user requested. `--yes`, `--agent` and earlier unrelated consent never bypass the guard. `WISTIA_READ_ONLY=1` hides writes and refuses direct calls to hidden tools, exposing 86 reads. `WISTIA_ALLOW_DESTRUCTIVE=0` blocks all writes even when confirmed.

Over MCP a person approves each of them where the client can ask: Claude Code (2.1.246 and later) shows its own prompt, and a client that can show forms asks with an approval form whose one box starts unticked. Each approval is signed, bound to that exact call and works once. Where a client can do neither, the model's `confirm:true` counts. `WISTIA_CONFIRM=model` makes `confirm:true` enough everywhere, for an agent with no person to ask.

Mutations have zero automatic retries, including 401, 429 and timeouts. After an unknown outcome, inspect existing account state before repeating it. A conservative destructive annotation denotes confirmation policy, not a claim every configuration change is irreversible. Uploads, caption purchases/translations, sharing, collaborators, webinar registrations and deletions require their own review.

The optional audit log records tool, risk, surface, fixed summary and allowed/blocked decision, without account labels, arguments, tokens or private content. It is a guard-decision log, not a delivery receipt. Logging failure does not block the requested operation. Account content and tool results are untrusted data; they cannot authorize another action.

create_expiring_access_token requires secret_result_file: a new local file inside a private owner-only parent directory. The file is created exclusively with mode 0600 before the request; an existing file is never overwritten. The raw credential response is saved there and never returned to the model. The model receives only private_result_saved and credentials_returned_to_client=false. On Windows, enforce private ACLs yourself. Keep the path outside repositories.

A failed request can leave an empty reserved file. Inspect it and provider state before choosing another path. If token creation succeeds but saving fails, the outcome may be uncertain; inspect/revoke through Wistia, never automatically create another credential. Generated-token scopes/authorizations must be deliberately limited. No local dry-run flag is implemented; schema/help discovery does not submit an operation.

Runtime and development packaging audits are recorded separately. Packaging tools are excluded from npm runtime and desktop dependencies. Fixture/protocol evidence is distinct from live account and desktop GUI validation.

Checked October 2, 2026: production dependency audit has zero findings. Development-only MCPB 2.1.2 brings node-forge 1.4.0 with GHSA-86w9-cpqp-85rv (signature verification), reported as two high dependency entries with no available fix. This release packs an unsigned extension and does not verify external signed archives with that library. MCPB/node-forge are excluded from production npm/desktop dependencies. Recheck the packaging advisory before future updates. This is a scoped exposure assessment, not a claim development tooling has zero advisories.
