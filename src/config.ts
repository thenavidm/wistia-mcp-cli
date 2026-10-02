export type Account = {
  name: string;
  apiToken: string;
  tokenFile: string;
  authScheme: "Bearer";
};
export type Config = {
  accounts: Account[];
  defaultAccount: string;
  readOnly: boolean;
  allowDestructive: boolean;
  auditPath: string;
  timeoutMs: number;
  maxRetries: number;
  minIntervalMs: number;
  apiVersion: string;
};
function integer(
  v: string | undefined,
  defaultValue: number,
  min: number,
  max: number,
): number {
  const n = v ? Number(v) : defaultValue;
  if (!Number.isInteger(n) || n < min || n > max)
    throw new Error("Invalid request timeout, retry or pacing settings.");
  return n;
}
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  let entries: Record<string, unknown>[] = [];
  if (env.WISTIA_ACCOUNTS)
    try {
      const x = JSON.parse(env.WISTIA_ACCOUNTS);
      if (!Array.isArray(x)) throw new Error();
      entries = x;
    } catch {
      throw new Error(
        "WISTIA_ACCOUNTS must be a private JSON array of named accounts.",
      );
    }
  else if (env.WISTIA_API_TOKEN || env.WISTIA_TOKEN_FILE)
    entries = [
      {
        name: "default",
        api_token: env.WISTIA_API_TOKEN,
        token_file: env.WISTIA_TOKEN_FILE,
        auth_scheme: env.WISTIA_AUTH_SCHEME,
      },
    ];
  if (env.WISTIA_API_VERSION && !/^20\d{2}-(0[1-9]|1[0-2])$/.test(env.WISTIA_API_VERSION)) throw new Error("WISTIA_API_VERSION must be a dated YYYY-MM release.");
  const accounts = entries.map((x) => {
    if (
      !x ||
      typeof x !== "object" ||
      typeof x.name !== "string" ||
      !x.name.trim()
    )
      throw new Error("Every Wistia account requires a unique nonempty name.");
    const authScheme = x.auth_scheme ?? "Bearer";
    if (authScheme !== "Bearer")
      throw new Error("Wistia requires Bearer authentication.");
    return {
      name: x.name.trim(),
      apiToken: typeof x.api_token === "string" ? x.api_token : "",
      tokenFile: typeof x.token_file === "string" ? x.token_file : "",
      authScheme: authScheme as "Bearer",
    };
  });
  if (new Set(accounts.map((a) => a.name)).size !== accounts.length)
    throw new Error("Wistia account names must be unique.");
  return {
    accounts,
    apiVersion: env.WISTIA_API_VERSION ?? "2026-09",
    defaultAccount: env.WISTIA_DEFAULT_ACCOUNT ?? accounts[0]?.name ?? "",
    readOnly: /^(1|true)$/i.test(env.WISTIA_READ_ONLY ?? ""),
    allowDestructive: !/^(0|false)$/i.test(env.WISTIA_ALLOW_DESTRUCTIVE ?? ""),
    auditPath: env.WISTIA_AUDIT_LOG ?? "",
    timeoutMs: integer(env.WISTIA_REQUEST_TIMEOUT_MS, 30000, 100, 300000),
    maxRetries: integer(env.WISTIA_MAX_RETRIES, 2, 0, 5),
    minIntervalMs: integer(env.WISTIA_MIN_REQUEST_INTERVAL_MS, 150, 0, 10000),
  };
}
export function selectAccount(config: Config, hint?: string): Account {
  const account = config.accounts.find(
    (a) => a.name === (hint ?? config.defaultAccount),
  );
  if (!account)
    throw new Error(
      config.accounts.length
        ? "Unknown account. Run list_accounts and use its exact name."
        : "No credentials configured. Set WISTIA_API_TOKEN or WISTIA_TOKEN_FILE privately; run wistia-cli login.",
    );
  return account;
}
