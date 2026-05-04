import type {
  CommandContext,
  CommandDefInput,
} from "@dragoon/defs/character.ts";

const aliases = {
  go: 2,
  move: 2,
  walk: 2,

  north: 1,
  south: 1,
  east: 1,
  west: 1,
  up: 1,
  down: 1,
  northwest: 6,
  northeast: 6,
  southwest: 6,
  southeast: 6,
  ne: 2,
  se: 2,
  nw: 2,
  sw: 2,
};

async function execute(
  context: CommandContext,
): Promise<void> {
  // TODO: implement
};

export default {
  id: "go",
  aliases,
  priority: 10,
  execute,
} satisfies CommandDefInput;
