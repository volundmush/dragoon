export function env(name: string, fallback?: string): string {
  const value = Deno.env.get(name) ?? fallback;

  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function envBool(name: string, fallback = false): boolean {
  const value = Deno.env.get(name);

  if (value === undefined || value === "") {
    return fallback;
  }

  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

export function envInt(name: string, fallback: number): number {
  const value = Deno.env.get(name);

  if (value === undefined || value === "") {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed)) {
    throw new Error(`Environment variable ${name} must be an integer`);
  }

  return parsed;
}
