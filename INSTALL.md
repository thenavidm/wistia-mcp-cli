# Install Wistia MCP Server & CLI

One npm package includes both binaries and all **169 tools**. Requires Node.js 22 or newer for CLI/manual MCP installs. Discovery works before account authentication. Account operations need eligible Wistia API access; Endpoint permissions and feature eligibility apply.

| Route | Program | Use |
| --- | --- | --- |
| Terminal | wistia-cli | Scripts and agents with a shell |
| Local MCP | wistia-mcp | AI clients supporting stdio |
| Desktop archive | wistia-3.0.0.mcpb | Compatible Claude Desktop custom extensions |
| Wistia-hosted alternative | https://api.wistia.com/mcp/api | Official remote OAuth, owner/manager access |

## Contents

[Requirements](#requirements) · [CLI](#cli) · [Private account setup](#private-account-setup) · [Claude Code](#claude-code) · [Codex](#codex) · [Claude Desktop](#claude-desktop) · [Cursor](#cursor) · [VS Code and Copilot](#vs-code-and-copilot) · [Windsurf](#windsurf) · [Zed](#zed) · [Gemini CLI](#gemini-cli) · [Docker](#docker) · [Verify](#verify) · [Multiple accounts](#multiple-accounts) · [Updates and removal](#updates-and-removal) · [Troubleshooting](#troubleshooting) · [Development](#development)

## Requirements

Install Node from [nodejs.org](https://nodejs.org/en/download). Open a new terminal and check `node --version` and `npm --version`. The desktop host needs a compatible Node runtime; dependencies are bundled. A GUI app may not inherit your terminal's environment. Check your account's current API access with Wistia instead of assuming npm installation provides it.

## CLI

On macOS/Linux, use Terminal. On Windows, use PowerShell or Command Prompt:

```bash
npm install -g @thenavidm/wistia-mcp-cli@latest
wistia-cli --version
wistia-cli
wistia-cli list-media --help
wistia-cli schema edit-captions-text
wistia-cli login
```

If PowerShell blocks npm.ps1, use npm.cmd or Command Prompt according to your policy. If a binary is missing, check `npm prefix -g`, ensure its executable directory is on PATH and open a new terminal. Avoid sudo as a workaround for PATH problems.

For one command without a global install:

```bash
npx -y --package @thenavidm/wistia-mcp-cli@latest wistia-cli tools
```

Make [SKILL.md](./SKILL.md) available in your agent's supported skill location. The installed file is `<npm root -g>/@thenavidm/wistia-mcp-cli/SKILL.md`. npm does not automatically register client skills. Your agent should read the actual schema and use --agent/--select for compact output.

## Private account setup

### Get a narrowly scoped private token

1. Sign in to the intended Wistia account. An Account Owner creates account API tokens.
2. Open **Account Settings > API**, following [Wistia's access-token instructions](https://docs.wistia.com/docs/making-api-requests).
3. Create a named token with only the permissions your task needs. Copy the token when it is shown at creation and store it privately.
4. Set `WISTIA_TOKEN_FILE` to an absolute token-only file outside repositories, or configure `WISTIA_API_TOKEN` only in private local client/shell settings.
5. Run `wistia-cli doctor`, then `wistia-cli doctor --network` for one account read. A token without permission to read account details can fail doctor while having narrower resource permissions.

Tokens use a Bearer header. Do not supply passwords, cookies or token values as tool arguments. This package has no automatic .env loader, OS keychain integration or OAuth callback. `login` prints instructions without generating or saving credentials. The official hosted MCP has its own OAuth connection, and the official CLI offers keychain setup.

On macOS/Linux, keep the token file owner-only (0600), with a private parent directory (0700). On Windows, protect it with user-only filesystem ACLs. Token files must be regular, not symlinks, and at most 64 KB. A file takes precedence over the environment token and is cached until the process restarts. GUI clients may not inherit terminal environment variables. Enter actual credentials only in private local settings, never project files, chats or issues.

### Permissions and feature eligibility

Read-media workflows normally need the read-folder/media permission. Editing, deleting, sharing, caption ordering, account administration and analytics use their specific endpoint permissions. The operation reference preserves the provider's declared permission requirements. Delegated tokens follow the assigned contact's permissions; they do not elevate access. A 401/403 may indicate token scope, account status, role or feature access, not a broken installation.

Webinars, localizations, accessibility orders, trials, media capacity and purchases depend on current account features and allowances. Installation does not purchase a plan or create quota. Read the intended endpoint and account's billing settings before chargeable operations. No universal paid-plan requirement is invented for every Data API call. Official hosted MCP access is documented for owners and managers. Keep that rule separate from the permission model of a scoped API token.

### Modern routes and dated API version

The service URL is `https://api.wistia.com/modern`. Requests include `X-Wistia-Api-Version: 2026-09` by default. The pinned official CLI v2026.9.0 schema identifies its document as 2026.09.0. Set `WISTIA_API_VERSION` only to a reviewed YYYY-MM release. The provider may resolve an unsupported date to an earlier supported release and may retire older versions; a header is not an indefinite compatibility guarantee. See the [modern migration guide](https://docs.wistia.com/docs/migration-from-v1-guide).

The uploader remains `https://upload.wistia.com/`, with form or multipart encoding and private Bearer authentication. Modern media/folder requests use the current schema. Folder request bodies retain some camelCase fields; uploader `project_id` is still valid. Do not mechanically rename every property to snake_case. Stats routes retain `/stats/projects`; a folder rename does not imply every Stats URL changed.

### Shared quota

Wistia documents 600 requests per minute across Data and Upload APIs for an account. The local default is 150 ms between requests per account/process, but other integrations and duplicate labels still share the provider's quota. Every page and retried read counts. GET 429 handling respects Retry-After only when the delay is at most ten seconds; a longer delay returns exit 7 for explicit caller pacing. POST queries and all mutations have no automatic retries. No process-local pacing setting reserves quota.


Temporary private shell settings:

```bash
export WISTIA_TOKEN_FILE='/absolute/private/wistia-token.txt'
wistia-cli doctor --network
```

PowerShell:

```powershell
$env:WISTIA_TOKEN_FILE = 'C:\Users\YOUR_USER\Private\wistia-token.txt'
wistia-cli doctor --network
```

### Agent-guided installation

> Help me install Wistia MCP Server & CLI with INSTALL.md. Check Node and the binary, let me configure my account credentials privately, then run discovery and doctor --network. Do not send messages or change members during setup.

## Codex

Codex is the current validation priority. Private token paths must exist in the process or remote environment where the server runs.

~~~bash
codex mcp add wistia -- npx -y @thenavidm/wistia-mcp-cli@latest
codex mcp list
~~~

Account credentials must reach the server through private environment settings. `codex mcp add --env NAME=value` stores values in your local config, so never commit that config or put secrets in a shared command. In TOML, the equivalent server is:

~~~toml
[mcp_servers.wistia]
command = "npx"
args = ["-y", "@thenavidm/wistia-mcp-cli@latest"]
env_vars = ["WISTIA_API_TOKEN", "WISTIA_TOKEN_FILE", "WISTIA_API_VERSION", "WISTIA_ACCOUNTS", "WISTIA_DEFAULT_ACCOUNT", "WISTIA_READ_ONLY"]
~~~

`env_vars` forwards those names from the environment available to Codex. If that environment does not contain them, configure private env settings locally. Codex can also call the CLI directly with SKILL.md and `--agent` output.

## Claude Code

For a user-scoped connection, after privately configuring credentials:

~~~bash
claude mcp add --scope user wistia -- npx -y @thenavidm/wistia-mcp-cli@latest
claude mcp list
~~~

Use the client's private local environment settings for the account variable if they are not inherited. Claude's `-e NAME=value` registration option writes values into its config; only use it locally through your secret manager, with no shared command transcript. Never place credentials in a project .mcp.json. Reconnect and ask Claude to verify credentials.

Alternatively install the CLI, make SKILL.md available to Claude, and use shell commands. Registering both surfaces is optional.

## Claude Desktop

### Install the .mcpb extension

1. Download `wistia-3.0.0.mcpb` from [GitHub Releases](https://github.com/thenavidm/wistia-mcp-cli/releases/latest).
2. In a supported Claude Desktop build, open **Settings > Extensions > Advanced settings > Install Extension…** and select it.
3. Enter a private Bearer token in the sensitive setting, or an absolute private token-file path. Leave the unused credential method empty. Wistia uses Bearer authentication.
4. Enable read-only if you want only the 86 reads. Reconnect and ask for account verification.

The bundle includes production dependencies and no credentials. Use a regular private token-only file if you prefer file-based credentials. The manifest requires Node 22 or newer from a compatible host. Organization policy may restrict custom extensions. Manual bundle updates require installing the new version; no automatic directory updates are promised. GUI installation remains unverified separately from archive/protocol checks.

### Manual config

Open **Settings > Developer > Edit Config**, or use your platform's config file:

| OS | Typical config path |
| --- | --- |
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |
| Linux | `~/.config/Claude/claude_desktop_config.json`; confirm the location through Edit Config in your installed build |

~~~json
{
  "mcpServers": {
    "wistia": {
      "command": "npx",
      "args": ["-y", "@thenavidm/wistia-mcp-cli@latest"],
      "env": {
        "WISTIA_API_TOKEN": "YOUR_PRIVATE_API_TOKEN",
        "WISTIA_TOKEN_FILE": ""
      }
    }
  }
}
~~~

Replace the placeholders only in your private file. Merge the server entry into an existing mcpServers object instead of replacing other integrations. Fully quit and reopen Claude Desktop. Do not enable an extension and a manual entry with the same name; choose one route.

If a Windows launcher cannot execute npx directly, use `"command": "cmd"` with `"args": ["/c", "npx", "-y", "@thenavidm/wistia-mcp-cli@latest"]`. An absolute node executable and installed `dist/index.js` path also avoids launcher/PATH problems.

## Cursor

Use private user settings at `~/.cursor/mcp.json`, or **Settings > Tools & MCP**. [Cursor documents environment interpolation and envFile support](https://cursor.com/docs/mcp).

~~~json
{
  "mcpServers": {
    "wistia": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@thenavidm/wistia-mcp-cli@latest"],
      "env": {
        "WISTIA_API_TOKEN": "${env:WISTIA_API_TOKEN}",
        "WISTIA_TOKEN_FILE": "${env:WISTIA_TOKEN_FILE}"
      }
    }
  }
}
~~~

The environment values must exist for the Cursor process. If you use envFile, keep that file private and outside version control. A project's .cursor/mcp.json must not contain actual credentials. Reconnect the server after saving.

## VS Code and Copilot

Use **MCP: Open User Configuration**. [VS Code uses servers and secure inputs](https://code.visualstudio.com/docs/agent-customization/mcp-servers), rather than a mcpServers root:

~~~json
{
  "inputs": [
    {"type": "promptString", "id": "wistia-api-key", "description": "Wistia scoped API token (leave empty for a private token file)", "password": true},
    {"type": "promptString", "id": "wistia-token-file", "description": "Optional private token-file path (leave empty for scoped API token)"}
  ],
  "servers": {
    "wistia": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@thenavidm/wistia-mcp-cli@latest"],
      "env": {
        "WISTIA_API_TOKEN": "${input:wistia-api-key}",
        "WISTIA_TOKEN_FILE": "${input:wistia-token-file}"
      }
    }
  }
}
~~~

Start Wistia through the MCP controls, approve trust if prompted, and enter credentials in the private input prompts. Workspace .vscode/mcp.json may contain this placeholder-only structure, but never resolved secret values. Remote development runs the server in the selected remote environment, so local file paths refer to that environment.

## Windsurf

Open Cascade's MCP settings or edit the private user file `~/.codeium/windsurf/mcp_config.json`. Use the Claude Desktop manual mcpServers block above with your locally configured env values. See [Windsurf's current MCP documentation](https://docs.devin.ai/desktop/cascade/mcp). Restart or reconnect Wistia in Cascade; project files must not contain secrets.

## Zed

Open **Settings > AI > MCP Servers > Add Server > Add Local Server**, or your user settings file. [Zed uses context_servers](https://zed.dev/docs/ai/mcp):

~~~json
{
  "context_servers": {
    "wistia": {
      "command": "npx",
      "args": ["-y", "@thenavidm/wistia-mcp-cli@latest"],
      "env": {
        "WISTIA_API_TOKEN": "YOUR_PRIVATE_API_TOKEN",
        "WISTIA_TOKEN_FILE": ""
      }
    }
  }
}
~~~

Enter actual values only in private user settings. Check the active-server indicator before prompting. Do not wrap command and args inside a nested command object from older Zed examples.

## Gemini CLI

Merge the Claude Desktop manual mcpServers block into your private `~/.gemini/settings.json`. Configure the private credential values locally, then restart Gemini CLI and inspect `/mcp`. See [Gemini CLI's MCP configuration](https://geminicli.com/docs/tools/mcp-server/). Its project settings must not contain real credentials. You can instead use the CLI from an agent shell.

Other local stdio clients use the same command and arguments, adapted to their config format. A client that only accepts a remote MCP URL cannot connect directly: this package does not ship a public HTTP listener. ChatGPT's remote connector setup is not a substitute for local stdio installation.

## Docker

Build locally from the reviewed source; no prebuilt registry image is claimed:

```bash
git clone https://github.com/thenavidm/wistia-mcp-cli.git
cd wistia-mcp-cli
docker build -t wistia-mcp-cli .
docker run --rm -i -e WISTIA_API_TOKEN wistia-mcp-cli
```


## Cline and other local MCP clients

Use the client's **Add MCP server** flow with command `npx`, arguments `-y` and `@thenavidm/wistia-mcp-cli@latest`, stdio transport, and private local WISTIA_API_TOKEN or WISTIA_TOKEN_FILE settings. UI names depend on the installed client. Reconnect and discover tools before an account call. Browser-only clients need a remote HTTPS connector; use Wistia's official server rather than this local stdio command.

## Verify

```bash
wistia-cli doctor
wistia-cli doctor --network
wistia-cli tools
wistia-cli schema list-folders
wistia-cli list-accounts --agent
```

The full server discovers 169 tools; read-only discovers 86. Help/schemas/list_accounts are local. The network doctor reads account details without returning private account details. A successful account read does not prove every endpoint's Admin permissions or plan eligibility.

To try read-only, privately set WISTIA_READ_ONLY=1, restart/reconnect and inspect discovery. All 83 writes must disappear and direct write calls must refuse. Remove/disable the setting and reconnect only when you need writes. `WISTIA_ALLOW_DESTRUCTIVE=0` separately blocks all 83 writes even when confirmed.

## Multiple accounts

Set private WISTIA_ACCOUNTS JSON, which replaces the single-account variables:

```json
[{"name":"work","api_token":"YOUR_PRIVATE_WORK_API_TOKEN"},{"name":"personal","token_file":"/absolute/private/path/personal-wistia.txt"}]
```

Set WISTIA_DEFAULT_ACCOUNT=work. `wistia-cli list-accounts --agent` lists labels and auth methods; `--account personal` selects another account. Keep the JSON out of public project configs. Separate server instances can provide stronger process-level isolation if needed.

## Updates and removal

```bash
npm install -g @thenavidm/wistia-mcp-cli@latest
wistia-cli --version
claude mcp remove --scope user wistia
codex mcp remove wistia
npm uninstall -g @thenavidm/wistia-mcp-cli
```

Reinstall a newer desktop archive separately and restart affected clients. Remove manual client entries using its own settings. Uninstalling the package does not revoke Wistia credentials, remove private token files or undo uploads, caption purchases, sharing or registrations. Revoke the scoped API token in Wistia when appropriate. Inspect and remove your private settings and files separately.

Pin a reviewed version instead of @latest if your automation requires reproducibility. Check [CHANGELOG.md](./CHANGELOG.md) and [GitHub Releases](https://github.com/thenavidm/wistia-mcp-cli/releases) before a major update. Do not roll back by blindly publishing an older version over an existing npm version.

## Troubleshooting

| Problem | Check |
| --- | --- |
| Missing command | Node 22+, global prefix and PATH |
| No configured account | Private WISTIA_API_TOKEN or regular WISTIA_TOKEN_FILE |
| GUI authentication fails | Actual private GUI environment; shell env is separate |
| 401/403 | scoped API token, account permissions and auth scheme, current account permissions |
| Invalid/null body | schema; use payload/payload_file for null and nested data |
| First page only | Native page/per_page and bounded all_pages with continuation metadata |
| Guard refusal | User-requested --confirm, read-only and destructive settings |
| Write timeout | Inspect account before repeating; no automatic write retries |
| Desktop host rejects extension | Compatible host/runtime and organization custom-extension policy |

See the README for the complete argument table, safety, 20 FAQs and API snapshot corrections. Secrets must never appear in a troubleshooting transcript.

## Development

```bash
git clone https://github.com/thenavidm/wistia-mcp-cli.git
cd wistia-mcp-cli
npm ci
npm run typecheck
npm run build
npm test
npm run check:counts
npm run build:mcpb
```

Source mode: configure private env, then register `node /absolute/path/wistia-mcp-cli/dist/index.js` as the MCP command. Build before registration and after source changes. No local credentials are packaged. [CONTRIBUTING.md](./CONTRIBUTING.md), [SECURITY.md](./SECURITY.md) and [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) cover contributions, disclosures and licensing.
