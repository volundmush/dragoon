import type { DerivedDefInput } from "@dragoon/defs/character.ts";

export default {
  id: "powerlevel",
  name: "PowerLevel",
  base: async ({ character, base }) => {
    return (await character.derived_get("health") + await character.derived_get("ki")) * 2;
  }
} satisfies DerivedDefInput;
