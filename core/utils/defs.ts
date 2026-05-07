export type DefModule = {
  default?: unknown;
};

export type DefConstructor<TInput, TDef extends { id: string }> = {
  new (input: TInput): TDef;
};

export async function loadDefFolder<TInput, TDef extends { id: string }>(
  path: string,
  Def: DefConstructor<TInput, TDef>,
): Promise<Record<string, TDef>> {
  const registry: Record<string, TDef> = {};

  try {
    const stat = await Deno.stat(path);

    if (!stat.isDirectory) {
      return registry;
    }
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return registry;
    }

    throw error;
  }

  for await (const file of walkDefFiles(path)) {
    const input = await importDefault(file);
    addDef(registry, new Def(input as TInput), file);
  }

  return registry;
}

export async function* walkDefFiles(path: string): AsyncGenerator<string> {
  for await (const entry of Deno.readDir(path)) {
    if (entry.name.startsWith("_")) {
      continue;
    }

    const child = `${path}/${entry.name}`;

    if (entry.isDirectory) {
      yield* walkDefFiles(child);
      continue;
    }

    if (
      entry.isFile &&
      (entry.name.endsWith(".ts") || entry.name.endsWith(".js"))
    ) {
      yield child;
    }
  }
}

export async function importDefault(path: string): Promise<unknown> {
  const stat = await Deno.stat(path);
  const url = new URL(`file://${path}`);
  url.searchParams.set("mtime", String(stat.mtime?.getTime() ?? 0));

  const module = await import(url.href) as DefModule;

  if (module.default === undefined) {
    throw new Error(`Def file must export default: ${path}`);
  }

  return module.default;
}

export function addDef<TDef extends { id: string }>(
  registry: Record<string, TDef>,
  def: TDef,
  path: string,
): void {
  if (!def.id) {
    throw new Error(`Def is missing required id: ${path}`);
  }

  if (registry[def.id]) {
    throw new Error(`Duplicate def id '${def.id}' from ${path}`);
  }

  registry[def.id] = def;
}
