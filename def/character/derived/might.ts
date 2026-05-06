import type { DerivedDefInput } from "@dragoon/defs/character.ts";

export default {
  id: "might",
  name: "Might",
  min: 1000,
  tags: ["attribute"],
  base: ({ character, base }) => {
    return character.stat_get("might");
  }
} satisfies DerivedDefInput;
