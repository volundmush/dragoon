import type { DerivedDefInput } from "@dragoon/defs/character.ts";

export default {
  id: "health",
  name: "Health",
  base: ({ character, base }) => {
    return 2 * (character.stat_get("might")
     + character.stat_get("endurance")
      + character.stat_get("agility")
       + character.stat_get("will"))
        + (character.stat_get("focus")
         + character.stat_get("insight")
          + character.stat_get("perception")
           + character.stat_get("presence"));
  }
} satisfies DerivedDefInput;
