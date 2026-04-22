const std = @import("std");

pub const Point = struct { x: i64, y: i64, z: i64 };

/// Component describing where an entity is in the world.
/// This might be a character, area, object's contents, etc.
pub const Location = struct {
    entity: u64,
    // For areas, point is coordinates in the area. if stored in a character, point is inventory/equip details.
    point: Point,
};

/// Component on item for if it is equipped and on what slot.
pub const Equipped = struct {};

/// What a character has in their inventory. A reverse of the Location component.
pub const Inventory = struct {};

/// What a character has equipped. A reverse of the Location component.
pub const Equipment = struct {};
