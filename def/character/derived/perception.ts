import type { DerivedDefInput } from "@dragoon/defs/character.ts";

export default {
  id: "perception",
  name: "Perception",
  min: 1000,
  tags: ["attribute"],
  base: ({ character, base }) => {
    return character.stat_get("perception");
  }
} satisfies DerivedDefInput;
