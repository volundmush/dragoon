const std = @import("std");
const ecs = @import("mr_ecs");

pub const Point = struct { x: i64, y: i64, z: i64 };

pub const LocationType = union(enum) {
    point: Point, // the coordinates within a grid (area, structure, etc.)
    equipped: []const u8, // The slot the item is equipped in?
    inventory: void, // For characters, the location of their inventory.
};

/// Component describing where an entity is in the world.
/// This might be a character, area, object's contents, etc.
/// This struct can also be used to point at a thing, like a destination to teleport to.
pub const Location = struct {
    /// The entity that this location describes.
    entity: ecs.Entity,
    /// Specifically where in the entity?
    at: LocationType,
};

/// What a character has in their inventory. A reverse of the Location component.
pub const Inventory = struct {
    contents: std.ArrayList(ecs.Entity),
};

/// What a character has equipped. A reverse of the Location component.
pub const Equipment = struct {
    equipment: std.StringHashMap(ecs.Entity),
};

/// What an Entity fully contains. This is a reverse of the Location component.
pub const Contents = struct {
    contents: std.AutoHashMap(ecs.Entity, LocationType),
};
