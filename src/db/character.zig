const std = @import("std");

/// All characters have a Race.
pub const Racial = struct {
    /// The lua id of the race (e.g. "human", "elf", "dwarf", etc.)
    id: []const u8,
    /// A character's might have extra-special data to store.
    data: std.json.Value,
};
