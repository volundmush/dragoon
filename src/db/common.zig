const std = @import("std");

pub const EntityType = enum {
    // Characters and Objects are both Things.
    Thing,
    // Areas and Structures are both Grids. The main difference is that Structures can have a Location.
    Area,
    Structure,
};

pub const Keywords = struct {
    keywords: std.ArrayList([]const u8),
};
