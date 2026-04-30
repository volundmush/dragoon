// IDs are strings (UUIDs)
export interface HasID {
    id: string;
}

export interface HasName {
  name: string;
}

export interface HasDescription {
  description: string;
}

export interface HasKeyWords {
    keywords: string[];
}

export interface HasInventory {
    inventory: string[];
}

// Commodities are "items" that a entities can have in arbitrary amounts,
// like gold, crafting materials, or even possibly abstract things like "elven favor". They don't have individual instance properties; the weight of gold coins is fixed and constant, so we can flyweight such things.
export interface HasCommodities {
    // mapping of commodity names to quantities.
    commodities: Record<string, number>;
}

// Some stats are derived, like max health or carry capacity.
export interface DerivedData {
    dirty: boolean;
    value: number;
}

// Storage for the derived stats cache.
export interface HasDerived {
    derived: Record<string, DerivedData>;
}

// Entities often have stats.
export interface HasStats {
    stats: Record<string, number>;
}

export type Point = {
    x: number;
    y: number;
    z: number;
};

export type LocationType =
   | {kind: "point"; point: Point}
   | {kind: "equipped"; slot: string[]}
   | {kind: "inventory"};

export type Location = {
    id: string;
    at: LocationType;
};