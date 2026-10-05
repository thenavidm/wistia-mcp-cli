import operationsData from "./operations.json" with { type: "json" };
import { type ValidateFunction } from "ajv";
import { Ajv2020 } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { dirname } from "node:path";
import { readFile, lstat, open } from "node:fs/promises";
import { createHash } from "node:crypto";
import type { Json, WistiaClient, QueryParam } from "../api/client.js";
import { UsageError } from "../api/errors.js";
import type { Config } from "../config.js";
import type { Risk } from "@thenavidm/slipway";
export type Operation = {
  name: string;
  title: string;
  description: string;
  method: string;
  path: string;
  group: string;
  risk: Risk;
  params: {
    name: string;
    key: string;
    in: string;
    required?: boolean;
    schema: Json;
    style?: string;
    explode?: boolean;
  }[];
  bodySchema: Json;
  bodyRequired: boolean;
  paginated: boolean;
  origin: "modern" | "upload";
  contentType: string;
};
export type ToolSpec = {
  name: string;
  title: string;
  description: string;
  group: string;
  inputSchema: Json;
  risk: Risk;
  handler: (args: Json, client: WistiaClient) => Promise<unknown>;
};
const operations = operationsData as unknown as Operation[];
const ajv = new Ajv2020({ allErrors: true, strict: false });
(addFormats as unknown as (a: typeof ajv) => void)(ajv);
function check(validate: ValidateFunction, args: unknown): void {
  if (!validate(args))
    throw new UsageError(ajv.errorsText(validate.errors, { separator: "; " }));
}
function fieldsFor(op: Operation): Json {
  const properties: Json = Object.fromEntries(
    op.params.map((p) => [p.key, p.schema]),
  );
  Object.assign(properties, op.bodySchema.properties ?? {});
  properties.account = {
    type: "string",
    description:
      "Named private Wistia account; selects credentials, not a remote account ID.",
  };
  if (op.name === "create_expiring_access_token") properties.secret_result_file = { type: "string", minLength: 1, description: "New private local result file, saved with exclusive creation and mode 0600. Parent must be owner-only on POSIX. No credentials are returned to the AI client." };
  if (op.risk !== "read")
    properties.confirm = {
      type: "boolean",
      description: "Must be true for the specific user-requested write.",
    };
  if (Object.keys(op.bodySchema.properties ?? {}).length) {
    properties.payload = {
      ...op.bodySchema,
      description:
        "Complete JSON request body instead of body flags. Supports current nested customization, caption and nullable values.",
    };
    properties.payload_file = {
      type: "string",
      minLength: 1,
      description:
        "Regular local JSON body file, at most 5 MB. Cannot be mixed with body flags or payload.",
    };
  }
  if (op.paginated) {
    properties.all_pages = {
      type: "boolean",
      description:
        "Read bounded page/per_page pages; each request consumes API quota. Not a snapshot or guaranteed complete backup.",
    };
    properties.max_items = {
      type: "integer",
      minimum: 1,
      maximum: 10000,
      description:
        "Maximum returned records with all_pages=true, default 1000. At most 100 requests; output includes continuation state.",
    };
  }
  return {
    type: "object",
    properties,
    required: [...op.params.filter((p) => p.required).map((p) => p.key), ...(op.name === "create_expiring_access_token" ? ["secret_result_file"] : [])],
    additionalProperties: false,
  };
}
// Each schema compiles on first use: compiling all of them at load held back the server's first answer. compileAll() runs them in tests.
const bodyValidators = new Map<string, ValidateFunction>();
function bodyValidator(op: Operation): ValidateFunction {
  let v = bodyValidators.get(op.name);
  if (!v) bodyValidators.set(op.name, (v = ajv.compile(op.bodySchema)));
  return v;
}
async function execute(
  op: Operation,
  args: Json,
  client: WistiaClient,
): Promise<unknown> {
  const flat = Object.fromEntries(
    Object.keys(op.bodySchema.properties ?? {})
      .filter((k) => args[k] !== undefined)
      .map((k) => [k, args[k]]),
  );
  if (
    (args.payload !== undefined || args.payload_file !== undefined) &&
    Object.keys(flat).length
  )
    throw new UsageError(
      "Use individual body flags or payload/payload_file without mixing them.",
    );
  if (args.payload !== undefined && args.payload_file !== undefined)
    throw new UsageError("Use payload or payload_file, not both.");
  if (op.bodyRequired && !Object.keys(flat).length && args.payload === undefined && args.payload_file === undefined) {
    throw new UsageError('This operation requires a JSON body; inspect schema and provide body flags or payload/payload_file.');
  }
  let body: Json = args.payload ?? flat;
  if (args.payload_file)
    try {
      const stat = await lstat(args.payload_file);
      if (!stat.isFile() || stat.size > 5 * 1024 * 1024) throw new Error();
      body = JSON.parse(await readFile(args.payload_file, "utf8"));
    } catch {
      throw new UsageError(
        "payload_file must be a regular JSON body file, at most 5 MB.",
      );
    }
  check(bodyValidator(op), body);
  if (
    ["PUT", "PATCH"].includes(op.method) &&
    Object.keys(op.bodySchema.properties ?? {}).length &&
    !Object.keys(body).length
  )
    throw new UsageError("Provide at least one field to update.");
  if (op.name === "edit_captions_text") {
    if (!Number.isInteger(body.expected_version) || body.expected_version < 1) throw new UsageError("expected_version must be a positive caption version from a fresh read.");
    for (const edit of body.edits) {
      const paired = edit.start_ms !== undefined || edit.end_ms !== undefined;
      if (paired && (!Number.isInteger(edit.start_ms) || !Number.isInteger(edit.end_ms) || edit.start_ms < 0 || edit.end_ms < edit.start_ms)) throw new UsageError("Caption edit start_ms/end_ms must be paired nonnegative integers in increasing order.");
    }
  }
  if (args.max_items !== undefined && !args.all_pages)
    throw new UsageError("max_items requires all_pages=true.");
  if (args.cursor && (args.page !== undefined || args.all_pages)) throw new UsageError("Native cursor cannot be combined with page/all_pages. Use one pagination mode.");
  const path = op.params
    .filter((p) => p.in === "path")
    .reduce(
      (path, p) =>
        path.replace(`{${p.name}}`, encodeURIComponent(String(args[p.key]))),
      op.path,
    );
  const query: QueryParam[] = op.params
    .filter((p) => p.in === "query" && args[p.key] !== undefined)
    .map((p) => ({
      name: p.name,
      value: args[p.key],
      style: p.style,
      explode: p.explode,
    }));
  if (!args.all_pages) {
    let secretFile: Awaited<ReturnType<typeof open>> | undefined;
    if (op.name === "create_expiring_access_token") {
      const parent = await lstat(dirname(args.secret_result_file)).catch(() => null);
      if (!parent?.isDirectory() || (process.platform !== "win32" && (parent.mode & 0o077))) throw new UsageError("Secret result parent must be a regular owner-only directory. Keep it outside repositories.");
      secretFile = await open(args.secret_result_file, "wx", 0o600).catch(() => { throw new UsageError("Secret result file must be a new private file; existing files are never overwritten."); });
    }
    try {
      const result = await client.request(op.method,path,query,op.bodyRequired || Object.keys(body).length ? body : undefined,args.account,op.origin,op.contentType);
      if (secretFile) {
        try { await secretFile.writeFile(JSON.stringify(result) + "\n"); await secretFile.sync(); }
        catch { throw new UsageError("Wistia may have created an expiring token, but its private result could not be saved. Do not automatically repeat creation; inspect and revoke through the provider."); }
        return { private_result_saved: true, credentials_returned_to_client: false };
      }
      return client.sanitize(result);
    } finally { await secretFile?.close(); }
  }
  const max = args.max_items ?? 1000;
  const perPage = Math.min(args.per_page ?? 10, max);
  let pageNumber = args.page ?? 1;
  let pages = 0;
  const records: unknown[] = [];
  const seen = new Set<string>();
  let last: Json = {};
  let batch: unknown[] = [];
  let hasNext = false;
  let skip = 0;
  let truncated = false;
  const fixed = query.filter((p) => !["page", "per_page"].includes(p.name));
  do {
    last = await client.request(
      "GET",
      path,
      [
        ...fixed,
        { name: "page", value: pageNumber },
        { name: "per_page", value: perPage },
      ],
      undefined,
      args.account,
    );
    pages++;
    if (!Array.isArray(last)) throw new UsageError("Wistia list response must be an array for bounded page retrieval.");
    batch = last as unknown as unknown[];
    hasNext = batch.length === perPage;
    const fingerprint = createHash("sha256")
      .update(JSON.stringify(batch))
      .digest("hex");
    if (
      hasNext &&
      (batch.length === 0 || seen.has(fingerprint))
    )
      throw new UsageError(
        "Wistia pagination is repeated; refusing further quota-consuming requests.",
      );
    seen.add(fingerprint);
    const remaining = max - records.length;
    const taken = batch.slice(0, remaining);
    records.push(...taken);
    skip = taken.length;
    const partial = taken.length < batch.length;
    truncated = partial || hasNext;
    if (partial || records.length >= max || pages >= 100) break;
    if (!hasNext) {
      truncated = false;
      break;
    }
    pageNumber++;
  } while (true);
  const partial = skip < batch.length;
  return client.sanitize({
    records,
    collected: records.length,
    pages,
    truncated,
    resume: truncated
      ? {
          page: partial ? pageNumber : pageNumber + 1,
          per_page: perPage,
          skip: partial ? skip : 0,
        }
      : null,
  });
}
export const ALL_TOOLS: ToolSpec[] = operations.map((op) => ({
  name: op.name,
  title: op.title,
  description: op.description,
  group: op.group,
  inputSchema: fieldsFor(op),
  risk: op.risk,
  handler: (args, client) => execute(op, args, client),
}));
ALL_TOOLS.push({
  name: "list_accounts",
  title: "List configured accounts",
  description:
    "List private account labels, default selection and configured token method. No credentials, token paths or account content; no network request.",
  group: "accounts",
  risk: "read",
  inputSchema: { type: "object", properties: {}, additionalProperties: false },
  handler: async (_args, client) => ({
    accounts: client.config.accounts.map((a) => ({
      name: a.name,
      default: a.name === client.config.defaultAccount,
      auth: a.tokenFile
        ? "token_file"
        : a.apiToken
          ? "api_token"
          : "not_configured",
      authScheme: a.authScheme,
    })),
  }),
});
const validators = new Map<string, ValidateFunction>();
function validatorFor(tool: ToolSpec): ValidateFunction {
  let v = validators.get(tool.name);
  if (!v) validators.set(tool.name, (v = ajv.compile(tool.inputSchema)));
  return v;
}
export function validateArguments(tool: ToolSpec, args: Json): void {
  check(validatorFor(tool), args);
}
/** Compile every input and body schema, as loading once did, so a test can prove they all compile. */
export function compileAll(): number {
  for (const t of ALL_TOOLS) validatorFor(t);
  for (const op of operations) bodyValidator(op);
  return validators.size + bodyValidators.size;
}
export function visibleTools(config: Config): ToolSpec[] {
  return ALL_TOOLS.filter((t) => !config.readOnly || t.risk === "read");
}
