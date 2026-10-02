#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { buildServer, VERSION } from "./server.js";
import { runCli, exitCodeFor } from "./cli.js";
import { runDoctor } from "./doctor.js";
import { basename } from "node:path";
const HELP = `Wistia MCP server and CLI ${VERSION}

wistia-mcp                         Start local stdio MCP
wistia-cli                         List task commands
wistia-cli <command> --help        Current arguments
wistia-cli schema <command>        Full JSON input schema
wistia-cli doctor [--network]      Local configuration / account read
wistia-cli login                   Private token setup instructions
wistia-cli --version               Package version

WISTIA_API_TOKEN                   Private Wistia Bearer API token
WISTIA_TOKEN_FILE                  Regular private token-only file, max 64 KB
WISTIA_API_VERSION                 2026-09 dated API release header
WISTIA_ACCOUNTS / _DEFAULT_ACCOUNT Named private credentials
WISTIA_READ_ONLY=1                 Hide/refuse all writes
WISTIA_ALLOW_DESTRUCTIVE=0         Block all writes
WISTIA_AUDIT_LOG                   Private guard-decision log
WISTIA_REQUEST_TIMEOUT_MS=30000; WISTIA_MAX_RETRIES=2 (GET 429 only)
WISTIA_MIN_REQUEST_INTERVAL_MS=150 Conservative per-account process pacing

https://github.com/thenavidm/wistia-mcp-cli
`;
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];
  if (["--version", "-v"].includes(command ?? "")) {
    console.log(VERSION);
    return;
  }
  if (["--help", "-h", "help"].includes(command ?? "")) {
    process.stdout.write(HELP);
    return;
  }
  if (command === "doctor") {
    if (args.slice(1).some((a) => a !== "--network")) {
      process.exitCode = 2;
      console.error(JSON.stringify({ error: "doctor accepts only --network" }));
      return;
    }
    process.exitCode = await runDoctor(args.includes("--network"));
    return;
  }
  if (command === "login") {
    console.log("In the intended Wistia account, ask the Account Owner to open Account Settings > API, create a narrowly scoped token and save it privately as WISTIA_API_TOKEN or an owner-only token-only file via WISTIA_TOKEN_FILE. The token is shown only at creation. login prints instructions; it does not save credentials, create a token or run OAuth. Official hosted MCP has its own OAuth or Bearer connection. Run wistia-cli doctor --network for one account read. See INSTALL.md.");
    return;
  }
  if (args.length || basename(process.argv[1] ?? "").startsWith("wistia-cli")) {
    process.exitCode = await runCli(args);
    return;
  }
  const server = buildServer();
  await server.connect(new StdioServerTransport());
  const close = async () => {
    await server.close();
    process.exit(0);
  };
  process.on("SIGTERM", () => void close());
  process.on("SIGINT", () => void close());
}
main().catch((e) => {
  console.error(JSON.stringify({ error: e.message }));
  process.exitCode = exitCodeFor(e.message);
});
