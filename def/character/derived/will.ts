import type { DerivedDefInput } from "@dragoon/defs/character.ts";

export default {
  id: "will",
  name: "Will",
  min: 1000,
  tags: ["attribute"],
  base: ({ character, base }) => {
    return character.stat_get("will");
  }
} satisfies DerivedDefInput;
