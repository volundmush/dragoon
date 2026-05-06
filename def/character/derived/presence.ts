import type { DerivedDefInput } from "@dragoon/defs/character.ts";

export default {
  id: "presence",
  name: "Presence",
  min: 1000,
  tags: ["attribute"],
  base: ({ character, base }) => {
    return character.stat_get("presence");
  }
} satisfies DerivedDefInput;
