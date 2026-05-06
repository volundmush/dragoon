import type { DerivedDefInput } from "@dragoon/defs/character.ts";

export default {
  id: "ki",
  name: "Ki",
  base: ({ character, base }) => {
    return (character.stat_get("might")
     + character.stat_get("endurance")
      + character.stat_get("agility")
       + character.stat_get("will"))
        + (character.stat_get("focus")
         + character.stat_get("insight")
          + character.stat_get("perception")
           + character.stat_get("presence")) * 2;
  }
} satisfies DerivedDefInput;
