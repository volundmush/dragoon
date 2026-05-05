import { RecordId } from "@surrealdb/surrealdb";
import { Character, CharacterData } from "@dragoon/types/character.ts";

export const database = {
    characters: new Map<RecordId<"character">, Character>(),
};


export function get_character(id: RecordId<"character">): Character | undefined {
    return database.characters.get(id);
}