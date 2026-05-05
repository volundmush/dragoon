import { RecordId } from "@surrealdb/surrealdb";

export type CharacterData = {
  id: RecordId<"character">;
  stats: Record<string, number>;
  [key: string]: any;
};

export class Character {
  constructor(public data: CharacterData) {}
}