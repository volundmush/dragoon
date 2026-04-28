const std = @import("std");
const grid = @import("grid.zig");
const ecs = @import("mr_ecs");

const zlua = @import("zlua");

const Lua = zlua.Lua;
const LuaType = zlua.LuaType;

pub const World = struct {
    allocator: std.mem.Allocator,
    next_id: u64 = 1,
    entities: ecs.Entities,
    /// Entities probably need some kind of unique ID for referencing and serialization...
    by_id: std.AutoHashMap(u64, ecs.Entity),
    lua: *Lua,

    pub fn init(allocator: std.mem.Allocator) !World {
        return World{
            .allocator = allocator,
            .entities = try ecs.Entities.init(.{ .gpa = allocator }),
            .by_id = std.AutoHashMap(u64, ecs.Entity).init(allocator),
            .lua = try Lua.init(allocator),
        };
    }

    pub fn deinit(self: *World) void {
        self.entities.deinit(self.allocator);
        self.by_id.deinit();
        self.lua.deinit();
    }
};
