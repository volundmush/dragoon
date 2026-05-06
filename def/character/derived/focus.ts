import type { DerivedDefInput } from "@dragoon/defs/character.ts";

export default {
  id: "focus",
  name: "Focus",
  min: 1000,
  tags: ["attribute"],
  base: ({ character, base }) => {
    return character.stat_get("focus");
  }
} satisfies DerivedDefInput;
