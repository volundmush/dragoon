const std = @import("std");

pub const ModifierKind = enum {
    // a flat number applied to base before all other modifiers.
    PreModifier,
    // applied after PreModifiers, but before Additive/Multiplicative. The lowest PreCeiling is used.
    PreCeiling,
    // applied after PreModifiers, but before Additive/Multiplicative. The highest PreFloor is used.
    PreFloor,
    // adds to a 1.0 multiplier for the stat. So 0.5 would be +50% of the base, -0.25 would be -25% of the base.
    Additive,
    // starting at 1.0, multiplies multiplier then applies. So if has two 0.5 in a row, result is 0.25
    Multiplicative,
    // a flat number applied to the total after all other modifiers.
    PostModifier,
    // applied after all other modifiers, restricts the total. The lowest PostCeiling is used.
    PostCeiling,
    // applied after all other modifiers, restricts the total. The highest PostFloor is used.
    PostFloor,
};

/// A Modifier represents a single change to a stat, either from an item, buff, debuff, etc.
/// It includes the kind of modifier and the value to apply.
pub const StatModifier = struct {
    kind: ModifierKind,
    value: f64,
};

/// StatData is a container for the stored information about a stat on a character.
/// It includes the base value, cached current value, and gathered modifiers applied to make the current_value if set.
pub const StatData = struct {
    base_value: f64,
    // Current value is calculated by applying
    // all bonuses/hediffs to the base, and is cached/cleared periodically.
    current_value: ?f64,
    modifiers: std.ArrayList(StatModifier),

    pub fn init(allocator: std.mem.Allocator, base_value: f64) !StatData {
        return StatData{
            .base_value = base_value,
            .current_value = null,
            .modifiers = std.ArrayList(StatModifier).init(allocator),
        };
    }

    pub fn deinit(self: *StatData) void {
        // deinit any fields here if necessary
        self.modifiers.deinit();
    }
};

/// Component for storing Stats of a character.
pub const Stats = struct {
    stats: std.StringHashMap(StatData),

    pub fn init(allocator: std.mem.Allocator) Stats {
        return Stats{
            .stats = std.StringHashMap(StatData).init(allocator),
        };
    }

    pub fn deinit(self: *Stats) void {
        // deinit all keys and values in the hashmap, then deinit the hashmap

        var it = self.stats.iterator();
        while (it.next()) |entry| {
            // deinit the key and value here if necessary
            self.stats.allocator.free(entry.key_ptr);
            entry.value_ptr.deinit();
        }

        self.stats.deinit();
    }
};

pub const HeDiffData = struct {};

pub const HeDiffs = struct {
    hediffs: std.StringHashMap(HeDiffData),
};

/// Health, mana etc.
/// The key of a meter links to other various rules elsewhere, like which stat it references for a "maximum".
pub const ResourceMeters = struct {
    // the floats should be from 0.0 to 1.0...
    meters: std.StringHashMap(f64),
};

pub const KeyWords = struct {};
