type DefModule = {
  default?: unknown;
};

type DefConstructor<TInput, TDef extends { id: string }> = {
  new (input: TInput): TDef;
};

export class DefLoader {
  async loadFromFolder(_path: string): Promise<void> {}

  protected async loadSubFolder<TInput, TDef extends { id: string }>(
    path: string,
    Def: DefConstructor<TInput, TDef>,
    registry: Record<string, TDef>,
  ): Promise<void> {
    this.clearRegistry(registry);

    try {
      const stat = await Deno.stat(path);

      if (!stat.isDirectory) {
        return;
      }
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        return;
      }

      throw error;
    }

    for await (const file of this.walkDefFiles(path)) {
      const input = await this.importDefault(file);
      this.addDef(registry, new Def(input as TInput), file);
    }
  }

  private async *walkDefFiles(path: string): AsyncGenerator<string> {
    for await (const entry of Deno.readDir(path)) {
      if (entry.name.startsWith("_")) {
        continue;
      }

      const child = `${path}/${entry.name}`;

      if (entry.isDirectory) {
        yield* this.walkDefFiles(child);
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

  private async importDefault(path: string): Promise<unknown> {
    const stat = await Deno.stat(path);
    const url = new URL(`file://${path}`);
    url.searchParams.set("mtime", String(stat.mtime?.getTime() ?? 0));

    const module = await import(url.href) as DefModule;

    if (module.default === undefined) {
      throw new Error(`Def file must export default: ${path}`);
    }

    return module.default;
  }

  private addDef<TDef extends { id: string }>(
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

  private clearRegistry<TDef>(registry: Record<string, TDef>): void {
    for (const id of Object.keys(registry)) {
      delete registry[id];
    }
  }
}
