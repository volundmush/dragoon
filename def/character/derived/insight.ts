import type { DerivedDefInput } from "@dragoon/defs/character.ts";

export default {
  id: "insight",
  name: "Insight",
  min: 1000,
  tags: ["attribute"],
  base: ({ character, base }) => {
    return character.stat_get("insight");
  }
} satisfies DerivedDefInput;
